import { AccountRegionDTOSchema } from "@/server/api-route/riot/account/AccountDTO";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerMatches = createServerFn({ method: "GET" })
  .validator(
    v.object({
      puuid: AccountRegionDTOSchema.entries.puuid,
      region: AccountRegionDTOSchema.entries.region,
      start: v.optional(v.number(), 0),
    })
  )
  .handler(async (ctx) => {
    const { start, region, puuid } = ctx.data;

    const { MatchService } = await import("@/server/services/Match");
    const data = await MatchService.getMatchIdsByPuuidPaged(
      {
        puuid,
        region,
      },
      {
        count: 10,
        start,
      }
    );

    return data;
  });
