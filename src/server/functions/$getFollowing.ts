import { $authMiddleware } from "@/server/middleware/$authMiddleware";
import { createServerFn } from "@tanstack/react-start";

export const $getFollowing = createServerFn({ method: "GET" })
  .middleware([$authMiddleware])
  .handler(async (ctx) => {
    const user = ctx.context.user;

    const { FollowService } = await import("@/server/services/FollowService");
    const data = await FollowService.getFollowing(user.id);

    return data;
  });

export type $GetFollowingType = Awaited<ReturnType<typeof $getFollowing>>;
