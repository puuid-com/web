import { MatchResults } from "@puuid/core/server/db/schema/match";
import { LolRegions } from "@puuid/core/shared/types/index";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerMatches = createServerFn({ method: "GET" })
  .validator(
    v.object({
      puuid: v.string(),
      region: v.picklist(LolRegions),
      filters: v.object({
        playedChampionIds: v.optional(v.array(v.number())),
        matchupChampionIds: v.optional(v.array(v.number())),
        teammatePuuids: v.optional(v.array(v.string())),
        ennemyPuuids: v.optional(v.array(v.string())),
        gameResult: v.optional(v.boolean()),
        global: v.optional(v.pipe(v.string(), v.trim())),
        resultType: v.optional(v.picklist(MatchResults)),
        page: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
        queueId: v.optional(v.number()),
        limit: v.optional(v.number()),
      }),
    }),
  )
  .handler(async (ctx) => {
    const { region, puuid, filters } = ctx.data;

    const { MatchService } = await import("@puuid/core/server/services/match/MatchService");
    const matches = await MatchService.getMatchesDBByPuuidFull(
      {
        puuid,
        region,
      },
      filters,
    );

    return matches;
  });

export type $GetSummonerMatchesType = Awaited<ReturnType<typeof $getSummonerMatches>>;
