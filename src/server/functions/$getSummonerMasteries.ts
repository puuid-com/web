import { AccountRegionDTOSchema } from "@puuid/core/server/api-route/riot/account/AccountDTO";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerMasteries = createServerFn({ method: "GET" })
  .validator(
    v.object({
      puuid: AccountRegionDTOSchema.entries.puuid,
      region: AccountRegionDTOSchema.entries.region,
    }),
  )
  .handler(async (ctx) => {
    const { region, puuid } = ctx.data;

    const { MasteryService } = await import("@puuid/core/server/services/MasteryService");
    const masteries = await MasteryService.getMasteryBySummoner({
      puuid,
      region,
    });

    return {
      masteries,
    };
  });

export type $GetSummonerMasteriesType = Awaited<ReturnType<typeof $getSummonerMasteries>>;
