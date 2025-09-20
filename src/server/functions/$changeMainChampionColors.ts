import { LolQueues } from "@puuid/core/shared/types/index";
import { $authMiddleware } from "@/server/middleware/$authMiddleware";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $changeMainChampionColors = createServerFn({ method: "GET" })
  .middleware([$authMiddleware])
  .validator(
    v.object({
      puuid: v.string(),
      queueType: v.picklist(LolQueues),
      skinId: v.number(),
    }),
  )
  .handler(async (ctx) => {
    const { puuid, queueType, skinId } = ctx.data;

    // ensureSummonerOwnership(puuid, ctx.context.verifiedPuuids);

    const { StatisticService } = await import("@puuid/core/server/services/StatisticService");

    return StatisticService.changeMainChampionColors(puuid, queueType, skinId);
  });

export type $changeMainChampionColorsType = Awaited<ReturnType<typeof $changeMainChampionColors>>;
