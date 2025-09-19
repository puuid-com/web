import { LolRegions } from "@puuid/core/server/types/riot/common";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getFeaturedMatches = createServerFn({ method: "GET" })
  .validator(v.picklist(LolRegions))
  .handler(async (ctx) => {
    const { SpectatorService } = await import("@puuid/core/server/services/SpectatorService");
    const data = await SpectatorService.getFeaturedGames(ctx.data);

    return data;
  });

export type $GetFeaturedGamesType = Awaited<ReturnType<typeof $getFeaturedMatches>>;
