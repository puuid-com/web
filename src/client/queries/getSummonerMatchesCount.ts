import type { LolQueueType } from "@puuid/core/shared/types/index";
import type { SummonerType } from "@puuid/core/server/db/schema/summoner";
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
