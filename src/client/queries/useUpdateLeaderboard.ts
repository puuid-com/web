import { $getSummonerMasteries } from "@/server/functions/$getSummonerMasteries";
import { useMutation } from "@tanstack/react-query";
import { $updateLeaderboard } from "@/server/functions/$updateLeaderboard";
import { useServerFn } from "@tanstack/react-start";
import type { LolApexTierType, LolQueueType, LolRegionType } from "@puuid/core/shared";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";

type Params = {
  queue: LolQueueType;
  tier: LolApexTierType;
  region: LolRegionType;
};

export const useUpdateLeaderboard = (data: Params) => {
  const $fn = useServerFn($updateLeaderboard);
  const router = useRouter();

  return useMutation({
    mutationFn: () => $fn({ data }),
    mutationKey: ["$updateLeaderboard", data],
    onSuccess: async (data) => {
      await router.invalidate();

      toast.success(
        `Leaderboard for ${data.leaderboard.region} tier ${data.leaderboard.tier} updated successfully!`,
      );
    },
  });
};

export type GetLeaderboardOptionsType = Awaited<ReturnType<typeof $getSummonerMasteries>>;
