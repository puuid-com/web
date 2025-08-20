import { LOL_QUEUES } from "@/server/services/Match/queues.type";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerByRiotID = createServerFn({ method: "GET" })
  .validator(v.string())
  .handler(async (ctx) => {
    const riotID = ctx.data;

    const { IDService } = await import("@/server/services/ID");
    const { db } = await import("@/server/db");
    const data = await db.transaction(async (tx) => {
      const data = await IDService.getByRiotIDTx(tx, riotID.replace("-", "#"));

      return {
        summoner: data,
      };
    });

    return data;
  });
