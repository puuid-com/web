import type { SummonerType } from "@puuid/core/server/db/schema/summoner";
import { $getSummonerMasteries } from "@/server/functions/$getSummonerMasteries";
import { queryOptions, useQuery } from "@tanstack/react-query";

type QueryParams = {
  summoner: Pick<SummonerType, "puuid" | "region">;
};

export const getSummonerMasteriesOptions = ({ summoner }: QueryParams) =>
  queryOptions({
    queryKey: ["getSummonerMasteriesOptions", summoner.puuid, summoner.region],
    queryFn: () =>
      $getSummonerMasteries({
        data: {
          puuid: summoner.puuid,
          region: summoner.region,
        },
      }),
    select: (data) => {
      return data;
    },
  });

export const useGetSummonerMasteries = (params: QueryParams) => {
  return useQuery(getSummonerMasteriesOptions(params));
};

export type GetSummonerMasteriesType = Awaited<ReturnType<typeof $getSummonerMasteries>>;
