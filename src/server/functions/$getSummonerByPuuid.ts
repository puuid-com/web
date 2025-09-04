import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerByPuuid = createServerFn({ method: "GET" })
  .validator(v.string())
  .handler(async (ctx) => {
    const puuid = ctx.data;

    const { SummonerService } = await import("@/server/services/summoner/SummonerService");
    const { db } = await import("@/server/db");
    const data = await db.transaction(async (tx) => {
      const data = await SummonerService.getOrCreateSummonerByPuuidTx(tx, puuid);

      return {
        summoner: data,
      };
    });

    return data;
  });
