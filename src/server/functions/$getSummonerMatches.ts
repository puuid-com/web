import { AccountRegionDTOSchema } from "@/server/api-route/riot/account/AccountDTO";
import { QueueTypes } from "@/server/api-route/riot/league/LeagueDTO";
import { LOL_QUEUES } from "@/server/services/Match/queues.type";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerMatches = createServerFn({ method: "GET" })
  .validator(
    v.object({
      puuid: AccountRegionDTOSchema.entries.puuid,
      region: AccountRegionDTOSchema.entries.region,
      queue: v.picklist(QueueTypes),
    })
  )
  .handler(async (ctx) => {
    const t0 = performance.now();

    const { region, puuid, queue } = ctx.data;

    const { MatchService } = await import("@/server/services/Match");
    const { db } = await import("@/server/db");
    const matches = await MatchService.getMatchesDBByPuuid(
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
    console.log(`$getSummonerMatches took ${t1 - t0}ms`);

    return {
      matches,
    };
  });

export type $GetSummonerMatchesType = Awaited<
  ReturnType<typeof $getSummonerMatches>
>;
