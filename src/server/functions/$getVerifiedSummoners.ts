import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getVerifiedSummoners = createServerFn({ method: "GET" })
  .validator(v.string())
  .handler(async (ctx) => {
    const userId = ctx.data;

    const { SummonerService } = await import("@/server/services/summoner");
    const summoners = await SummonerService.getVerifiedSummoners(userId);

    return summoners;
  });

export type $GetVerifiedSummonersType = Awaited<ReturnType<typeof $getVerifiedSummoners>>;
