import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerByRiotID = createServerFn({ method: "GET" })
  .validator(v.string())
  .handler(async (ctx) => {
    const riotID = ctx.data;

    const { SummonerService } = await import(
      "@puuid/core/server/services/summoner/SummonerService"
    );
    const { db } = await import("@puuid/core/server/db");
    const data = await db.transaction(async (tx) => {
      const data = await SummonerService.getOrCreateSummonerByRiotIDTx(tx, riotID);

      return {
        summoner: data,
      };
    });

    return data;
  });
