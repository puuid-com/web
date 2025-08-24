import type {
  LeagueDTOType,
  LolQueueType,
} from "@/server/api-route/riot/league/LeagueDTO";
import { db, type TransactionType } from "@/server/db";
import type {
  MatchRowType,
  MatchWithSummonersType,
} from "@/server/db/match-schema";
import type { LeagueRowType, SummonerType } from "@/server/db/schema";
import { pipeStep } from "@/server/lib/generator";
import { SummonerService } from "@/server/services/summoner";
import { LeagueService } from "@/server/services/league";
import type { LeaguesType } from "@/server/services/league/type";
import { LOL_QUEUES } from "@/server/services/match/queues.type";
import { StatisticService } from "@/server/services/statistic";
import { SummonerDTOService } from "@/server/services/summoner-dto";
import type { LolRegionType } from "@/server/types/riot/common";

export type FetchingSummonerSteps = {
  step: "fetching_summoner";
};

export type FetchingMatchesSteps =
  | { step: "fetching_matches"; matchesToFetch: number }
  | { step: "fetching_matches"; matchesFetched: number };

export type SavingMatchesSteps = {
  step: "saving_matches";
};

export type FetchingLeaguesSteps = {
  step: "fetching_leagues";
};

export type FetchingStatsSteps = {
  step: "fetching_stats";
};

export type StepsType =
  | FetchingSummonerSteps
  | FetchingMatchesSteps
  | SavingMatchesSteps
  | FetchingLeaguesSteps
  | FetchingStatsSteps;

export type RefreshProgressMsgType =
  | ({
      status: "step_started" | "step_finished" | "step_in_progress";
    } & StepsType)
  | {
      status: "started" | "finished";
    };

export class RefreshService {
  static async *refreshSummonerData(
    puuid: SummonerType["puuid"],
    queueType: LolQueueType
  ): AsyncGenerator<RefreshProgressMsgType, void, void> {
    const queueId = LOL_QUEUES[queueType].queueId;

    yield { status: "started" };

    // progressFetchSummoner()
    const { stream: $summonerStream, result: $summonerResult } = pipeStep(
      this.progressFetchSummoner(puuid)
    );
    for await (const msg of $summonerStream) yield msg;
    const summoner = await $summonerResult;

    // progressFetchMatches()
    const { stream: $matchesStream, result: $matchesResult } = pipeStep(
      this.progressFetchMatches(summoner, queueId)
    );
    for await (const msg of $matchesStream) yield msg;
    const matches = await $matchesResult;

    // progressFetchLeagues()
    const { stream: $leaguesStream, result: $leaguesResult } = pipeStep(
      this.progressFetchLeagues(summoner)
    );
    for await (const msg of $leaguesStream) yield msg;
    const leagues = await $leaguesResult;

    // progressFetchStats()
    const { stream: $statsStream } = pipeStep(
      this.progressFetchStats(summoner, queueType, leagues, matches)
    );
    for await (const msg of $statsStream) yield msg;

    yield { status: "finished" };
  }

  private static async *progressFetchSummoner(
    puuid: SummonerType["puuid"]
  ): AsyncGenerator<RefreshProgressMsgType, SummonerType, void> {
    yield { status: "step_started", step: "fetching_summoner" };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    yield { status: "step_in_progress", step: "fetching_summoner" };

    const summoner = await db.transaction((tx) =>
      SummonerService.getSummonerByPuuidTx(tx, puuid, true)
    );

    yield { status: "step_finished", step: "fetching_summoner" };

    return summoner;
  }

  private static async *progressFetchMatches(
    id: Pick<SummonerType, "region" | "puuid">,
    queueId: MatchRowType["queueId"]
  ): AsyncGenerator<RefreshProgressMsgType, MatchWithSummonersType[], void> {
    const { MatchService } = await import("@/server/services/match");

    const ids = await MatchService._getAllMatcheIdsDTOByPuuid(id, queueId);

    yield {
      status: "step_in_progress",
      step: "fetching_matches",
      matchesToFetch: ids.length,
      ids: ids,
    } as any;

    const alreadySaved = await MatchService.getMatchesDBByMatchIds(ids);

    const notSavedIds = ids.filter(
      (mid) => !alreadySaved.some((m) => m.matchId === mid)
    );

    if (alreadySaved.length > 0) {
      yield {
        status: "step_in_progress",
        step: "fetching_matches",
        matchesFetched: alreadySaved.length,
      };
    }

    const batchSize = 200;
    const totalBatches = Math.ceil(notSavedIds.length / batchSize);
    const allNewMatches: MatchWithSummonersType[] = alreadySaved;

    for (let b = 0; b < totalBatches; b++) {
      const start = b * batchSize;
      const end = Math.min(notSavedIds.length, start + batchSize);
      const slice = notSavedIds.slice(start, end);

      const tasks = slice.map((mid, i) => MatchService.getMatchDTOById(mid));

      const newMatches = await Promise.all(tasks);

      yield {
        status: "step_in_progress",
        step: "fetching_matches",
        matchesFetched: newMatches.length,
      };

      const _newMatches = await db.transaction(async (tx) => {
        return await MatchService.saveMatchesDTOtoDBTx(tx, newMatches);
      });

      allNewMatches.push(..._newMatches);
    }

    return allNewMatches;
  }

  private static async *progressFetchLeagues(
    id: Pick<SummonerType, "region" | "puuid">
  ): AsyncGenerator<RefreshProgressMsgType, LeagueRowType[], void> {
    yield { status: "step_started", step: "fetching_leagues" };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    yield { status: "step_in_progress", step: "fetching_leagues" };

    const leagues = await db.transaction((tx) =>
      LeagueService.cacheLeaguesTx(tx, id)
    );

    yield { status: "step_finished", step: "fetching_leagues" };

    return leagues;
  }

  private static async *progressFetchStats(
    id: Pick<SummonerType, "region" | "puuid">,
    queue: LolQueueType,
    leagues: LeagueRowType[],
    matches: MatchWithSummonersType[]
  ): AsyncGenerator<RefreshProgressMsgType, void, void> {
    yield { status: "step_started", step: "fetching_stats" };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    yield { status: "step_in_progress", step: "fetching_stats" };

    await db.transaction(async (tx) => {
      try {
        await StatisticService.refreshSummonerStatisticTx(
          tx,
          id,
          queue,
          leagues,
          matches
        );
      } catch (e) {
        console.error("Error fetching stats:", e);
        tx.rollback();
      }
    });

    yield { status: "step_finished", step: "fetching_stats" };
  }
}
