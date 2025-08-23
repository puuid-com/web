import { LolQueues } from "@/server/api-route/riot/league/LeagueDTO";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $postRefreshSummonerData = createServerFn({ method: "POST" })
  .validator(
    v.object({
      puuid: v.string(),
      queueType: v.picklist(LolQueues),
    })
  )
  .handler(async (ctx) => {
    const { puuid, queueType } = ctx.data;

    const { RefreshService } = await import("@/server/services/refresh");
    const { db } = await import("@/server/db");

    const data = await db.transaction((tx) =>
      RefreshService.refreshSummonerDataTx(tx, puuid, queueType)
    );

    return data;
  });
