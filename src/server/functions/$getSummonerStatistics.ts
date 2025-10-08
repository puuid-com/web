import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerStatistics = createServerFn({ method: "GET" })
  .validator(
    v.object({
      puuid: v.string(),
    }),
  )
  .handler(async (ctx) => {
    const params = ctx.data;

    const { SummonerRefreshService } = await import(
      "@puuid/core/server/services/SummonerRefreshService"
    );
    const [data] = await SummonerRefreshService.getSummonerRefreshes([params.puuid]);

    return data ?? null;
  });

export type $GetSummonerStatisticsType = NonNullable<
  Awaited<ReturnType<typeof $getSummonerStatistics>>
>;
