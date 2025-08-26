import { LolRegions } from "@/server/types/riot/common";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getActiveGames = createServerFn({ method: "GET" })
  .validator(
    v.object({
      puuid: v.string(),
      region: v.picklist(LolRegions),
    }),
  )
  .handler(async (ctx) => {
    const { SpectatorService } = await import("@/server/services/spectator");
    const data = await SpectatorService.getActiveGame({
      region: ctx.data.region,
      puuid: ctx.data.puuid,
    });

    return data;
  });

export type $GetActiveGameType = Awaited<ReturnType<typeof $getActiveGames>>;
