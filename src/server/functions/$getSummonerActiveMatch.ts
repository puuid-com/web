import { LolRegions } from "@puuid/core/shared/types/index";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerActiveMatch = createServerFn({ method: "GET" })
  .validator(
    v.strictObject({
      puuid: v.string(),
      region: v.picklist(LolRegions),
    }),
  )
  .handler(async (ctx) => {
    const { SpectatorService } = await import("@puuid/core/server/services/SpectatorService");
    const data = await SpectatorService.getActiveGameData(ctx.data);

    return data;
  });

export type $GetSummonerActiveMatchType = Awaited<ReturnType<typeof $getSummonerActiveMatch>>;
