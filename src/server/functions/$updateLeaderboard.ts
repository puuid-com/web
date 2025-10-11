import { LolApexTiers, LolRankedQueues, LolRegions } from "@puuid/core/shared";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $updateLeaderboard = createServerFn({ method: "GET" })
  .validator(
    v.object({
      tier: v.picklist(LolApexTiers),
      region: v.picklist(LolRegions),
      queue: v.picklist(LolRankedQueues),
    }),
  )
  .handler(async (ctx) => {
    const { queue, region, tier } = ctx.data;

    const { LeaderboardService } = await import("@puuid/core/server/services/LeaderboardService");
    const data = await LeaderboardService.updateLeaderboard(tier, region, queue, new Date());

    return data;
  });

export type $UpdateLeaderboardType = Awaited<ReturnType<typeof $updateLeaderboard>>;
