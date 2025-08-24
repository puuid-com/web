import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";
import type { SummonerType } from "@/server/db/schema";
import { $getSummonerStatsByPuuid } from "@/server/functions/$getSummonerStatsByPuuid";
import { queryOptions, useQuery } from "@tanstack/react-query";

type QueryParams = {
  summoner: Pick<SummonerType, "puuid" | "region">;
  queue: LolQueueType;
};

export const getSummonerStatsOptions = ({ summoner, queue }: QueryParams) =>
  queryOptions({
    queryKey: ["getSummonerStatsOptions", summoner, queue],
    queryFn: () =>
      $getSummonerStatsByPuuid({
        data: {
          puuid: summoner.puuid,
          queue,
        },
      }),
  });

export const useGetSummonerStats = (params: QueryParams) => {
  return useQuery(getSummonerStatsOptions(params));
};
