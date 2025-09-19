import { AccountRegionDTOSchema } from "@puuid/core/server/api-route/riot/account/AccountDTO";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerStatistics = createServerFn({ method: "GET" })
  .validator(
    v.object({
      puuid: AccountRegionDTOSchema.entries.puuid,
    }),
  )
  .handler(async (ctx) => {
    const params = ctx.data;

    const { StatisticService } = await import("@puuid/core/server/services/StatisticService");
    const data = await StatisticService.getSummonerStatistics(params.puuid);

    return data;
  });

export type $GetSummonerStatisticsType = NonNullable<
  Awaited<ReturnType<typeof $getSummonerStatistics>>
>;
