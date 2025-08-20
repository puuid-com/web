import type { QueueType } from "@/server/api-route/riot/league/LeagueDTO";
import type { SummonerType } from "@/server/db/schema";
import { $getSummonerMatches } from "@/server/functions/$getSummonerMatches";
import { $getSummonerStatsByPuuid } from "@/server/functions/$getSummonerStatsByPuuid";
import { queryOptions, useQuery } from "@tanstack/react-query";

type QueryParams = {
  summoner: Pick<SummonerType, "puuid" | "region">;
  queue: QueueType;
};

export const getSummonerStatsOptions = ({ summoner, queue }: QueryParams) =>
  queryOptions({
    queryKey: ["getSummonerStatsOptions", summoner],
    queryFn: () =>
      $getSummonerStatsByPuuid({
        data: {
          puuid: summoner.puuid,
          region: summoner.region,
          queue,
        },
      }),
  });

export const useGetSummonerStats = (params: QueryParams) => {
  return useQuery(getSummonerStatsOptions(params));
};
