import { AccountRegionDTOSchema } from "@/server/api-route/riot/account/AccountDTO";
import { LolQueues } from "@/server/api-route/riot/league/LeagueDTO";
import { LOL_QUEUES } from "@/server/services/match/queues.type";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerMatches = createServerFn({ method: "GET" })
  .validator(
    v.object({
      puuid: AccountRegionDTOSchema.entries.puuid,
      region: AccountRegionDTOSchema.entries.region,
      queue: v.picklist(LolQueues),
    })
  )
  .handler(async (ctx) => {
    await new Promise<void>((resolve) => setTimeout(resolve, 2000));

    const t0 = performance.now();

    const { region, puuid, queue } = ctx.data;

    const { MatchService } = await import("@/server/services/match");
    const { db } = await import("@/server/db");
    const matches = await MatchService.getMatchesDBByPuuidSmall(
      {
        puuid,
        region,
      },
      {
        queue: LOL_QUEUES[queue].queueId,
        start: 0,
        count: 9999,
      }
    );

    const t1 = performance.now();

    return {
      matches,
    };
  });

export type $GetSummonerMatchesType = Awaited<
  ReturnType<typeof $getSummonerMatches>
>;
