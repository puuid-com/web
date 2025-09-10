import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getMatchDetails = createServerFn({ method: "GET" })
  .validator(
    v.object({
      matchId: v.string(),
    }),
  )
  .handler(async (ctx) => {
    const { matchId } = ctx.data;

    const { MatchService } = await import("@/server/services/match/MatchService");
    const details = await MatchService.getMatchTimelineDTOById(matchId);

    return details;
  });

export type $getMatchDetailsType = Awaited<ReturnType<typeof $getMatchDetails>>;
