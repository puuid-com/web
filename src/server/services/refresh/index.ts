import type {
  LeagueDTOType,
  LolQueueType,
} from "@/server/api-route/riot/league/LeagueDTO";
import type { MatchDTOType } from "@/server/api-route/riot/match/MatchDTO";
import { db, type TransactionType } from "@/server/db";
import type { MatchRowType } from "@/server/db/match-schema";
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
    const { stream: $matchesStream } = pipeStep(
      this.progressFetchMatches(summoner, queueId)
    );
    for await (const msg of $matchesStream) yield msg;

    // progressFetchLeagues()
    const { stream: $leaguesStream, result: $leaguesResult } = pipeStep(
      this.progressFetchLeagues(summoner)
    );
    for await (const msg of $leaguesStream) yield msg;
    const leagues = await $leaguesResult;

    // progressFetchStats()
    const { stream: $statsStream } = pipeStep(
      this.progressFetchStats(summoner, queueType, leagues)
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
  ): AsyncGenerator<RefreshProgressMsgType, void, void> {
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

    const withTimeout = <T>(
      p: Promise<T>,
      ms: number,
      idx: number,
      mid: string
    ) =>
      new Promise<
        | { ok: true; value: T; idx: number; mid: string }
        | { ok: false; error: unknown; idx: number; mid: string }
      >((resolve) => {
        let settled = false;
        const timer = setTimeout(() => {
          if (!settled) {
            console.warn(
              `[progressFetchMatches] Match #${idx}-${mid} timed out after ${ms}ms`
            );
            resolve({ ok: false, error: new Error("timeout"), idx, mid });
          }
        }, ms);
        p.then((value) => {
          settled = true;
          clearTimeout(timer);
          resolve({ ok: true, value, idx, mid });
        }).catch((err) => {
          settled = true;
          clearTimeout(timer);
          console.error(`[progressFetchMatches] Match #${idx} failed`, err);
          resolve({ ok: false, error: err, idx, mid });
        });
      });

    const tasks = notSavedIds.map((mid, i) =>
      withTimeout(MatchService.getMatchDTOById(mid), 20_000, i, mid)
    );

    const never = new Promise<never>(() => {});
    const slots = tasks.slice();
    let remaining = slots.length;

    const batchSize = 50;
    let buffer: MatchDTOType[] = [];

    const flush = async () => {
      if (buffer.length === 0) return;

      await db.transaction(async (tx) => {
        await MatchService.saveMatchesDTOtoDBTx(tx, buffer);
      });

      buffer = [];
    };

    while (remaining > 0) {
      const r = await Promise.race(slots);

      if (r && typeof r === "object" && "idx" in r) {
        const idx = r.idx;
        slots[idx] = never;
        remaining -= 1;

        if (r.ok) {
          buffer.push(r.value);

          yield {
            status: "step_in_progress",
            step: "fetching_matches",
            matchesFetched: 1,
          };

          if (buffer.length >= batchSize) {
            await flush();
          }
        } else {
          console.warn(
            `[progressFetchMatches] Skipping match #${idx} ${r.mid} due to error/timeout`
          );
          yield {
            status: "step_in_progress",
            step: "fetching_matches",
            matchesFetched: 0,
          };
        }
      } else {
        console.error(
          `[progressFetchMatches] Unexpected race result, breaking loop to avoid infinite wait`
        );
        break;
      }
    }

    await flush();
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
    leagues: LeagueRowType[]
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
          leagues
        );
      } catch (e) {
        console.error("Error fetching stats:", e);
        tx.rollback();
      }
    });

    yield { status: "step_finished", step: "fetching_stats" };
  }
}
