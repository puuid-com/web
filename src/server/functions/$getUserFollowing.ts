import { $authMiddleware } from "@/server/middleware/$authMiddleware";
import { createServerFn } from "@tanstack/react-start";

export const $getUserFollowers = createServerFn({ method: "GET" })
  .middleware([$authMiddleware])
  .handler(async (ctx) => {
    const { user } = ctx.context;

    const { FollowService } = await import("@puuid/core/server/services/FollowService");
    const following = await FollowService.getFollowing(user.id);

    return {
      following,
    };
  });

export type $getUserFollowersType = Awaited<ReturnType<typeof $getUserFollowers>>;
