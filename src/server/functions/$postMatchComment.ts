import { $authMiddleware } from "@/server/middleware/$authMiddleware";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $postMatchComment = createServerFn({ method: "POST" })
  .middleware([$authMiddleware])
  .validator(
    v.object({
      matchId: v.string(),
      puuid: v.string(),
      text: v.string(),
    }),
  )
  .handler(async (ctx) => {
    const { user } = ctx.context;

    const { CommentService } = await import("@/server/services/CommentService");

    const data = await CommentService.createComment({
      matchId: ctx.data.matchId,
      puuid: ctx.data.puuid,
      tags: "",
      text: ctx.data.text,
      userId: user.id,
    });

    return data;
  });

export type $postMatchCommentType = Awaited<ReturnType<typeof $postMatchComment>>;
