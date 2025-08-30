import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";
import { db } from "@/server/db";
import type { MatchRowType, MatchWithSummonersType } from "@/server/db/match-schema";
import { summonerRefresh, type LeagueRowType, type SummonerType } from "@/server/db/schema";
import { pipeStep } from "@/server/lib/generator";
import { SummonerService } from "@/server/services/summoner";
import { LeagueService } from "@/server/services/league";
import { LOL_QUEUES } from "@/server/services/match/queues.type";
import { StatisticService } from "@/server/services/statistic";
import { eq } from "drizzle-orm";

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
      status: "started";
    }
  | {
      status: "finished";
      lastMatches: MatchWithSummonersType[];
    };

export class RefreshService {
  private static MIN_TIME_BETWEEN_REFRESH = 30 * 1000; // 30 sec

  static async getLastRefresh(puuid: SummonerType["puuid"]) {
    return db.query.summonerRefresh.findFirst({
      where: eq(summonerRefresh.puuid, puuid),
    });
  }

  static async canRefresh(puuid: SummonerType["puuid"]) {
    const lastRefresh = await this.getLastRefresh(puuid);
    if (!lastRefresh) return true;

    const timeSinceLastRefresh = new Date().getTime() - lastRefresh.refreshedAt.getTime();
    return timeSinceLastRefresh > this.MIN_TIME_BETWEEN_REFRESH;
  }

  static async updateLastRefresh(
    puuid: SummonerType["puuid"],
    lastMatchCreationMs: MatchRowType["gameCreationMs"] | null,
  ) {
    const lastGameCreationEpochSec = lastMatchCreationMs
      ? Math.floor(lastMatchCreationMs / 1000)
      : null;

    return db
      .insert(summonerRefresh)
      .values({ puuid, lastGameCreationEpochSec })
      .onConflictDoUpdate({
        target: [summonerRefresh.puuid],
        set: {
          lastGameCreationEpochSec,
          refreshedAt: new Date(),
        },
      });
  }

  static async *refreshSummonerData(
    puuid: SummonerType["puuid"],
    queueType: LolQueueType,
  ): AsyncGenerator<RefreshProgressMsgType, void, void> {
    const lastRefresh = await this.getLastRefresh(puuid);

    const queueId = LOL_QUEUES[queueType].queueId;

    yield { status: "started" };

    // progressFetchSummoner()
    const { stream: $summonerStream, result: $summonerResult } = pipeStep(
      this.progressFetchSummoner(puuid),
    );
    for await (const msg of $summonerStream) yield msg;
    const summoner = await $summonerResult;

    // progressFetchMatches()
    const { stream: $matchesStream /* , result: $matchesResult */ } = pipeStep(
      this.progressFetchMatches(
        summoner,
        queueId,
        lastRefresh?.lastGameCreationEpochSec ?? undefined,
      ),
    );
    for await (const msg of $matchesStream) yield msg;

    // progressFetchLeagues()
    const { stream: $leaguesStream, result: $leaguesResult } = pipeStep(
      this.progressFetchLeagues(summoner),
    );
    for await (const msg of $leaguesStream) yield msg;
    const leagues = await $leaguesResult;

    // progressFetchStats()
    const { stream: $statsStream, result: $statsResult } = pipeStep(
      this.progressFetchStats(summoner, queueType, leagues /* , matches */),
    );
    for await (const msg of $statsStream) yield msg;
    const { matches } = await $statsResult;

    await this.updateLastRefresh(puuid, matches[0]?.gameCreationMs ?? null);

    yield { status: "finished", lastMatches: matches };
  }

  private static async *progressFetchSummoner(
    puuid: SummonerType["puuid"],
  ): AsyncGenerator<RefreshProgressMsgType, SummonerType, void> {
    yield { status: "step_started", step: "fetching_summoner" };

    await new Promise((resolve) => setTimeout(resolve, 500));

    yield { status: "step_in_progress", step: "fetching_summoner" };

    const summoner = await db.transaction((tx) =>
      SummonerService.getOrCreateSummonerByPuuidTx(tx, puuid, true),
    );

    yield { status: "step_finished", step: "fetching_summoner" };

    return summoner;
  }

  private static async *progressFetchMatches(
    id: Pick<SummonerType, "region" | "puuid">,
    queueId: MatchRowType["queueId"],
    startTimeEpoch: number | undefined,
  ): AsyncGenerator<RefreshProgressMsgType, MatchWithSummonersType[], void> {
    const { MatchService } = await import("@/server/services/match");

    const ids = await MatchService._getAllMatcheIdsDTOByPuuid(id, queueId, startTimeEpoch);

    yield {
      status: "step_in_progress",
      step: "fetching_matches",
      matchesToFetch: ids.length,
    };

    if (ids.length === 0) {
      yield { status: "step_finished", step: "fetching_matches", matchesFetched: 0 };

      return [];
    }

    const alreadySaved = await MatchService.getMatchesDBByMatchIds(ids);

    const notSavedIds = ids.filter((mid) => !alreadySaved.some((m) => m.matchId === mid));

    if (alreadySaved.length > 0) {
      yield {
        status: "step_in_progress",
        step: "fetching_matches",
        matchesFetched: alreadySaved.length,
      };
    }

    const batchSize = 50;
    const totalBatches = Math.ceil(notSavedIds.length / batchSize);
    const allNewMatches: MatchWithSummonersType[] = alreadySaved;

    for (let b = 0; b < totalBatches; b++) {
      const start = b * batchSize;
      const end = Math.min(notSavedIds.length, start + batchSize);
      const slice = notSavedIds.slice(start, end);

      const tasks = slice.map((mid) => MatchService.getMatchDTOById(mid, false));

      const newMatches = await Promise.all(tasks);

      yield {
        status: "step_in_progress",
        step: "fetching_matches",
        matchesFetched: newMatches.length,
      };

      if (newMatches.length === 0) continue;

      const _newMatches = await db.transaction(async (tx) => {
        return await MatchService.saveMatchesDTOtoDBTx(tx, newMatches);
      });

      allNewMatches.push(..._newMatches);

      console.log(`Fetched batch ${b + 1}/${totalBatches}`);
    }

    yield { status: "step_finished", step: "fetching_matches", matchesFetched: 0 };

    return allNewMatches;
  }

  private static async *progressFetchLeagues(
    id: Pick<SummonerType, "region" | "puuid">,
  ): AsyncGenerator<RefreshProgressMsgType, LeagueRowType[], void> {
    yield { status: "step_started", step: "fetching_leagues" };

    await new Promise((resolve) => setTimeout(resolve, 500));

    yield { status: "step_in_progress", step: "fetching_leagues" };

    const leagues = await db.transaction((tx) => LeagueService.cacheLeaguesTx(tx, id));

    yield { status: "step_finished", step: "fetching_leagues" };

    return leagues;
  }

  private static async *progressFetchStats(
    id: Pick<SummonerType, "region" | "puuid">,
    queue: LolQueueType,
    leagues: LeagueRowType[],
    matches?: MatchWithSummonersType[],
  ): AsyncGenerator<RefreshProgressMsgType, { matches: MatchWithSummonersType[] }, void> {
    yield { status: "step_started", step: "fetching_stats" };

    await new Promise((resolve) => setTimeout(resolve, 500));

    yield { status: "step_in_progress", step: "fetching_stats" };

    const _matches = await db.transaction(async (tx) => {
      return await StatisticService.refreshSummonerStatisticTx(tx, id, queue, leagues, matches);
    });

    yield { status: "step_finished", step: "fetching_stats" };

    return _matches;
  }
}
