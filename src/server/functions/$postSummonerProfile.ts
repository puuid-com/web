import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $postSummonerProfile = createServerFn({ method: "POST" })
  .validator(
    v.object({
      puuid: v.string(),
      imageSrc: v.string(),
    }),
  )
  .handler(async (ctx) => {
    const puuid = ctx.data.puuid;
    const imageSrc = ctx.data.imageSrc;

    const { CacheService } = await import("@puuid/core/server/services/CacheService");
    const data = await CacheService.saveImageToCache(puuid, imageSrc, "summoner-profile");

    return {
      etag: data.etag,
    };
  });
