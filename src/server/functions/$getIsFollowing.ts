import { $authMiddleware } from "@/server/middleware/$authMiddleware";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getIsFollowing = createServerFn({ method: "GET" })
  .middleware([$authMiddleware])
  .validator(
    v.object({
      puuid: v.string(),
    }),
  )
  .handler(async (ctx) => {
    const user = ctx.context.user;
    const { puuid } = ctx.data;

    const { FollowService } = await import("@/server/services/FollowService");
    const data = await FollowService.isFollowing(puuid, user.id);

    return data;
  });

export type $getIsFollowingType = Awaited<ReturnType<typeof $getIsFollowing>>;
