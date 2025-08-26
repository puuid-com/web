import type { SummonerType } from "@/server/db/schema";
import { $getSummonerStatistics } from "@/server/functions/$getSummonerStatistics";
import { queryOptions, useQuery } from "@tanstack/react-query";

type QueryParams = {
  summoner: Pick<SummonerType, "puuid" | "region">;
};

export const getSummonerStatisticsOptions = ({ summoner }: QueryParams) =>
  queryOptions({
    queryKey: ["getSummonerStatsOptions", summoner],
    queryFn: () =>
      $getSummonerStatistics({
        data: {
          puuid: summoner.puuid,
        },
      }),
  });

export const useGetSummonerStatistics = (params: QueryParams) => {
  return useQuery(getSummonerStatisticsOptions(params));
};
