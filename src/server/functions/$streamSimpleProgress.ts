import type { MatchDTOType } from "@/server/api-route/riot/match/MatchDTO";
import type { MatchRowType } from "@/server/db/match-schema";
import type { SummonerType } from "@/server/db/schema";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export type FetchingSummonerSteps = {
  step: "fetching_summoner";
};

export type FetchingMatchesSteps =
  | { step: "fetching_matches"; matchesToFetch: number }
  | { step: "fetching_matches"; matchesFetched: number };

export type FetchingLeaguesSteps = {
  step: "fetching_leagues";
};

export type FetchingStatsSteps = {
  step: "fetching_stats";
};

export type StepsType =
  | FetchingSummonerSteps
  | FetchingMatchesSteps
  | FetchingLeaguesSteps
  | FetchingStatsSteps;

export type SimpleProgressMsg =
  | { status: "started" | "finished" }
  | ({ status: "in_progress" } & StepsType);

async function* progressFetchSummoner(
  _id: Pick<SummonerType, "region" | "puuid">
): AsyncGenerator<SimpleProgressMsg, void, void> {
  yield { status: "in_progress", step: "fetching_summoner" };
}

async function* progressFetchMatches(
  id: Pick<SummonerType, "region" | "puuid">,
  queueId: MatchRowType["queueId"]
): AsyncGenerator<SimpleProgressMsg, void, void> {
  const { MatchService } = await import("@/server/services/Match");

  const ids = await MatchService._getAllMatcheIdsDTOByPuuid(id, queueId);

  yield {
    status: "in_progress",
    step: "fetching_matches",
    matchesToFetch: ids.length,
  };

  const alreadySaved = await MatchService.getMatchesDBByMatchIds(ids);
  const notSavedIds = ids.filter(
    (mid) => !alreadySaved.some((m) => m.matchId === mid)
  );

  if (alreadySaved.length > 0) {
    yield {
      status: "in_progress",
      step: "fetching_matches",
      matchesFetched: alreadySaved.length,
    };
  }

  const newMatches: MatchDTOType[] = [];

  const tasks: Array<Promise<{ data: MatchDTOType; idx: number }>> =
    notSavedIds.map(async (mid, i) => {
      const data = await MatchService.getMatchDTOById(mid);
      return { data, idx: i };
    });

  const never = new Promise<never>(() => {});
  const slots = tasks.slice();
  let remaining = slots.length;

  while (remaining > 0) {
    const r = await Promise.race(slots);
    newMatches.push(r.data);
    slots[r.idx] = never;
    remaining -= 1;

    yield {
      status: "in_progress",
      step: "fetching_matches",
      matchesFetched: 1,
    };
  }

  if (newMatches.length > 0) {
    const { db } = await import("@/server/db");
    await db.transaction((tx) =>
      MatchService.saveMatchesDTOtoDBTx(tx, newMatches)
    );
  }
}

async function* progressFetchLeagues(
  _id: Pick<SummonerType, "region" | "puuid">
): AsyncGenerator<SimpleProgressMsg, void, void> {
  yield { status: "in_progress", step: "fetching_leagues" };
}

async function* progressFetchStats(
  _id: Pick<SummonerType, "region" | "puuid">
): AsyncGenerator<SimpleProgressMsg, void, void> {
  yield { status: "in_progress", step: "fetching_stats" };
}

async function* simpleProgress(
  id: Pick<SummonerType, "region" | "puuid">,
  queueId: MatchRowType["queueId"]
): AsyncGenerator<SimpleProgressMsg, void, void> {
  yield { status: "started" };

  for await (const msg of progressFetchSummoner(id)) yield msg;
  for await (const msg of progressFetchMatches(id, queueId)) yield msg;
  for await (const msg of progressFetchLeagues(id)) yield msg;
  for await (const msg of progressFetchStats(id)) yield msg;

  yield { status: "finished" };
}

export const $streamSimpleProgress = createServerFn({
  method: "POST",
  response: "raw",
})
  .validator(
    v.object({
      puuid: v.string(),
      region: v.string(),
      queue: v.string(),
    })
  )
  .handler(async ({ data, signal }) => {
    const { puuid, queue, region } = data;
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (obj: unknown) =>
          controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));

        try {
          for await (const msg of simpleProgress(
            { puuid, region } as any,
            420
          )) {
            if (signal.aborted) break;
            send(msg);
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
        Connection: "keep-alive",
      },
    });
  });
