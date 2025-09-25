import { LolApexTiers, LolQueues, LolRegions } from "@puuid/core/shared";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getLeaderboard = createServerFn({ method: "GET" })
  .validator(
    v.object({
      tier: v.picklist(LolApexTiers),
      region: v.picklist(LolRegions),
      queue: v.picklist(LolQueues),
    }),
  )
  .handler(async (ctx) => {
    const { queue, region, tier } = ctx.data;

    const { LeaderboardService } = await import("@puuid/core/server/services/LeaderboardService");
    const data = await LeaderboardService.getLeaderboard(tier, region, queue, new Date());

    return data;
  });

export type $GetLeaderboardType = Awaited<ReturnType<typeof $getLeaderboard>>;
