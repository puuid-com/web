import { LolQueues } from "@puuid/core/shared/types/index";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerStatistic = createServerFn({ method: "GET" })
  .validator(
    v.object({
      puuid: v.string(),
      queue: v.picklist(LolQueues),
    }),
  )
  .handler(async (ctx) => {
    const params = ctx.data;

    const { SummonerRefreshService } = await import(
      "@puuid/core/server/services/SummonerRefreshService"
    );
    const [data] = await SummonerRefreshService.getQueueSummonerRefreshes(
      [params.puuid],
      params.queue,
    );

    return data ?? null;
  });

export type $GetSummonerStatisticType = NonNullable<
  Awaited<ReturnType<typeof $getSummonerStatistic>>
>;
