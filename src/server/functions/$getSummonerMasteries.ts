import { LolRegions } from "@puuid/core/shared/types/index";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerMasteries = createServerFn({ method: "GET" })
  .validator(
    v.object({
      puuid: v.string(),
      region: v.picklist(LolRegions),
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
