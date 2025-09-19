import { AccountRegionDTOSchema } from "@puuid/core/server/api-route/riot/account/AccountDTO";
import { LolQueues } from "@puuid/core/server/api-route/riot/league/LeagueDTO";
import { LOL_QUEUES } from "@puuid/core/server/services/match/queues";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerMatches = createServerFn({ method: "GET" })
  .validator(
    v.object({
      puuid: AccountRegionDTOSchema.entries.puuid,
      region: AccountRegionDTOSchema.entries.region,
      queue: v.picklist(LolQueues),
      count: v.optional(v.number()),
    }),
  )
  .handler(async (ctx) => {
    await new Promise<void>((resolve) => setTimeout(resolve, 2000));

    const { region, puuid, queue, count } = ctx.data;

    const { MatchService } = await import("@puuid/core/server/services/match/MatchService");
    const matches = await MatchService.getMatchesDBByPuuidFull(
      {
        puuid,
        region,
      },
      {
        queue: LOL_QUEUES[queue].queueId,
        count: count,
      },
    );

    return {
      matches,
    };
  });

export type $GetSummonerMatchesType = Awaited<ReturnType<typeof $getSummonerMatches>>;
