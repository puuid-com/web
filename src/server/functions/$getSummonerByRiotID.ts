import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerByRiotID = createServerFn({ method: "GET" })
  .validator(v.string())
  .handler(async (ctx) => {
    const riotID = ctx.data;

    const { SummonerService } = await import("@/server/services/summoner");
    const { db } = await import("@/server/db");
    const data = await db.transaction(async (tx) => {
      const data = await SummonerService.getSummonerByRiotIDTx(tx, riotID.replace("-", "#"));

      return {
        summoner: data,
      };
    });

    return data;
  });
