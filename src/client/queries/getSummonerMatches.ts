import type { QueueType } from "@/server/api-route/riot/league/LeagueDTO";
import type { SummonerType } from "@/server/db/schema";
import { $getSummonerMatches } from "@/server/functions/$getSummonerMatches";
import { queryOptions, useQuery } from "@tanstack/react-query";

type QueryParams = {
  summoner: Pick<SummonerType, "puuid" | "region">;
  queue: QueueType;
};

export const getSummonerMatchesOptions = ({ summoner, queue }: QueryParams) =>
  queryOptions({
    queryKey: ["getSummonerMatchesOptions", summoner],
    queryFn: () =>
      $getSummonerMatches({
        data: {
          puuid: summoner.puuid,
          region: summoner.region,
          queue,
        },
      }),
  });

export const useGetSummonerMatches = (params: QueryParams) => {
  return useQuery(getSummonerMatchesOptions(params));
};

export type GetSummonerMatchesType = Awaited<
  ReturnType<typeof $getSummonerMatches>
>;
