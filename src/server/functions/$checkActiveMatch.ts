import { LolRegions } from "@puuid/core/shared/types/index";
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
    const { SpectatorService } = await import("@puuid/core/server/services/SpectatorService");
    const data = await SpectatorService.getActiveGame({
      region: ctx.data.region,
      puuid: ctx.data.puuid,
    });

    return !!data;
  });

export type $IsInActiveMatch = Awaited<ReturnType<typeof $isInActiveMatch>>;
