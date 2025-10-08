import { $authMiddleware } from "@/server/middleware/$authMiddleware";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $changeMainChampionColors = createServerFn({ method: "GET" })
  .middleware([$authMiddleware])
  .validator(
    v.object({
      puuid: v.string(),
      skinId: v.number(),
    }),
  )
  .handler(async (ctx) => {
    const { puuid, skinId } = ctx.data;

    // ensureSummonerOwnership(puuid, ctx.context.verifiedPuuids);

    const { SummonerService } = await import("@puuid/core/server/services/SummonerService");

    return SummonerService.changeMainChampionColors(puuid, skinId);
  });

export type $changeMainChampionColorsType = Awaited<ReturnType<typeof $changeMainChampionColors>>;
