import { LolQueues, LolRegions, LOL_QUEUES } from "@puuid/core/shared/types/index";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerMatchesCount = createServerFn({ method: "GET" })
  .validator(
    v.object({
      puuid: v.string(),
      region: v.picklist(LolRegions),
      queue: v.picklist(LolQueues),
    }),
  )
  .handler(async (ctx) => {
    const { region, puuid, queue } = ctx.data;

    const { MatchService } = await import("@puuid/core/server/services/match/MatchService");
    const data = await MatchService.getMatchesDBCountByPuuid(
      {
        puuid,
        region,
      },
      {
        queue: LOL_QUEUES[queue].queueId,
      },
    );

    return {
      count: data,
    };
  });

export type $getSummonerMatchesCountType = Awaited<ReturnType<typeof $getSummonerMatchesCount>>;
