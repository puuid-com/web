import type { LolQueueType } from "@puuid/core/shared/types/index";
import type { SummonerType } from "@puuid/core/server/db/schema/summoner";
import { $getSummonerStatistic } from "@/server/functions/$getSummonerStatistic";
import { queryOptions, useQuery } from "@tanstack/react-query";

type QueryParams = {
  summoner: Pick<SummonerType, "puuid" | "region">;
  queue: LolQueueType;
};

export const getSummonerStatisticOptions = ({ summoner, queue }: QueryParams) =>
  queryOptions({
    queryKey: ["getSummonerStatisticOptions", summoner, queue],
    queryFn: () =>
      $getSummonerStatistic({
        data: {
          puuid: summoner.puuid,
          queue,
        },
      }),
  });

export const useGetSummonerStatistic = (params: QueryParams) => {
  return useQuery(getSummonerStatisticOptions(params));
};
