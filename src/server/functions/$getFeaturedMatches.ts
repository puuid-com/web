import { LolRegions } from "@/server/types/riot/common";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getFeaturedMatches = createServerFn({ method: "GET" })
  .validator(v.picklist(LolRegions))
  .handler(async (ctx) => {
    const { SpectatorService } = await import("@/server/services/spectator");
    const data = await SpectatorService.getFeaturedGames(ctx.data);

    return data;
  });

export type $GetFeaturedGamesType = Awaited<ReturnType<typeof $getFeaturedMatches>>;
