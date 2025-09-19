import { LolRegions } from "@puuid/core/server/types/riot/common";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getActiveMatch = createServerFn({ method: "GET" })
  .validator(
    v.object({
      puuid: v.string(),
      region: v.picklist(LolRegions),
    }),
  )
  .handler(async (ctx) => {
    const { SpectatorService } = await import("@puuid/core/server/services/SpectatorService");
    const data = await SpectatorService.getActiveGameData({
      region: ctx.data.region,
      puuid: ctx.data.puuid,
    });

    return data;
  });

export type $GetActiveGameType = Awaited<ReturnType<typeof $getActiveMatch>>;
