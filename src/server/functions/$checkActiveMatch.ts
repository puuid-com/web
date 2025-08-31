import { LolRegions } from "@/server/types/riot/common";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $isInActiveMatch = createServerFn({ method: "GET" })
  .validator(
    v.strictObject({
      puuid: v.string(),
      region: v.picklist(LolRegions),
    }),
  )
  .handler(async (ctx) => {
    const { SpectatorService } = await import("@/server/services/SpectatorService");
    const data = await SpectatorService.getActiveGame({
      region: ctx.data.region,
      puuid: ctx.data.puuid,
    });

    console.log("isInActiveMatch", data?.gameId);

    return !!data;
  });

export type $IsInActiveMatch = Awaited<ReturnType<typeof $isInActiveMatch>>;
