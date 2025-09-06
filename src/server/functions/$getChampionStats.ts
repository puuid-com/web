import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getChampionStats = createServerFn({ method: "GET" })
  .validator(
    v.object({
      championId: v.number(),
    }),
  )
  .handler(async (ctx) => {
    const { ChampionService } = await import("@/server/services/ChampionService");
    const stats = await ChampionService.getChampionStatsByPosition(ctx.data.championId);
    return { stats };
  });

export type $GetChampionStatsType = Awaited<ReturnType<typeof $getChampionStats>>;
