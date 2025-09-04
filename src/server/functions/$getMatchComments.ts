import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getMatchComments = createServerFn({ method: "GET" })
  .validator(
    v.object({
      matchId: v.string(),
    }),
  )
  .handler(async (ctx) => {
    const { matchId } = ctx.data;

    const { CommentService } = await import("@/server/services/CommentService");

    const data = await CommentService.getMatchComments(matchId);

    return data;
  });

export type $getMatchCommentsType = Awaited<ReturnType<typeof $getMatchComments>>;
