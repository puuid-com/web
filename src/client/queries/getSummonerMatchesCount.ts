import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";
import type { SummonerType } from "@/server/db/schema";
import { $getSummonerMatchesCount } from "@/server/functions/$getSummonerMatchesCount";
import { queryOptions, useQuery } from "@tanstack/react-query";

type QueryParams = {
  summoner: Pick<SummonerType, "puuid" | "region">;
  queue: LolQueueType;
};

export const getSummonerMatchesCountOptions = ({ summoner, queue }: QueryParams) =>
  queryOptions({
    queryKey: ["getSummonerMatchesCountOptions", summoner, queue],
    queryFn: () =>
      $getSummonerMatchesCount({
        data: {
          puuid: summoner.puuid,
          region: summoner.region,
          queue,
        },
      }),
  });

export const useGetSummonerMatchesCount = (params: QueryParams) => {
  return useQuery(getSummonerMatchesCountOptions(params));
};
