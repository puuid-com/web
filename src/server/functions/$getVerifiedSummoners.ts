import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getVerifiedSummoners = createServerFn({ method: "GET" })
  .validator(v.string())
  .handler(async (ctx) => {
    const userId = ctx.data;

    const { SummonerService } = await import("@/server/services/summoner");
    const summoners = await SummonerService.getVerifiedSummoners(userId);

    const mainAccount = summoners.find((s) => s.isMain);
    const otherAccounts = summoners.filter((s) => !s.isMain);

    return {
      mainSummoner: mainAccount,
      otherSummoners: otherAccounts,
      summoners: summoners.sort((a, b) => {
        // First, sort by isMain (main accounts first)
        if (a.isMain !== b.isMain) {
          return a.isMain ? -1 : 1;
        }
        // Then sort by summonerLevel in descending order
        return b.summonerLevel - a.summonerLevel;
      }),
    };
  });

export type $GetVerifiedSummonersType = Awaited<ReturnType<typeof $getVerifiedSummoners>>;
