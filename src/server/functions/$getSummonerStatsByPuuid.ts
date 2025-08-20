import { AccountRegionDTOSchema } from "@/server/api-route/riot/account/AccountDTO";
import { QueueTypes } from "@/server/api-route/riot/league/LeagueDTO";
import { LOL_QUEUES } from "@/server/services/Match/queues.type";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerStatsByPuuid = createServerFn({ method: "GET" })
  .validator(
    v.object({
      puuid: AccountRegionDTOSchema.entries.puuid,
      region: AccountRegionDTOSchema.entries.region,
      queue: v.picklist(QueueTypes),
    })
  )
  .handler(async (ctx) => {
    const params = ctx.data;

    const { StatisticService } = await import("@/server/services/statistic");
    const { db } = await import("@/server/db");
    const data = await db.transaction((tx) =>
      StatisticService.getSummonerStatisticTx(tx, params, params.queue)
    );

    return data;
  });
