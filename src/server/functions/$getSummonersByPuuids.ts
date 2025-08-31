import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonersByPuuids = createServerFn({ method: "GET" })
  .validator(v.array(v.string()))
  .handler(async (ctx) => {
    const puuids = ctx.data;

    const { SummonerService } = await import("@/server/services/summoner/SummonerService");
    const data = await SummonerService.getOrCreateSummonersByPuuids(puuids);

    return data;
  });
