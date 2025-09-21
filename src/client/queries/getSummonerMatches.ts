import { $getSummonerMatches } from "@/server/functions/$getSummonerMatches";
import { queryOptions, useQuery } from "@tanstack/react-query";
import type { SummonerType } from "@puuid/core/server/db/schema/summoner";
import type { Route } from "@/routes/lol/summoner/$riotID/matches";
import { friendlyQueueTypeToRiot } from "@/client/lib/typeHelper";
import { LOL_QUEUES } from "@puuid/core/shared/types/index";

export type MatchesRouteSearchType = (typeof Route)["types"]["fullSearchSchema"];

type QueryParams = {
  summoner: Pick<SummonerType, "puuid" | "region">;
  filters: MatchesRouteSearchType;
};

export const getSummonerMatchesKey = (params: QueryParams) =>
  [
    "getSummonerMatchesOptions",
    params.summoner.puuid,
    params.filters,
    params.summoner.region,
  ] as const;

export const getSummonerMatchesOptions = ({ summoner, filters }: QueryParams) =>
  queryOptions({
    queryKey: getSummonerMatchesKey({ summoner, filters }),
    queryFn: () =>
      $getSummonerMatches({
        data: {
          puuid: summoner.puuid,
          region: summoner.region,
          filters: {
            limit: 10,
            page: filters.p,
            global: undefined,

            gameResult: filters.w,
            matchupChampionIds: filters.mc,
            playedChampionIds: filters.pc,
            queueId: LOL_QUEUES[friendlyQueueTypeToRiot(filters.q)].queueId,
            resultType: "NORMAL",
            teammatePuuids: filters.t,
            ennemyPuuids: filters.pa,
          },
        },
      }),
  });

export const useGetSummonerMatches = (params: QueryParams) => {
  return useQuery(getSummonerMatchesOptions(params));
};

export type GetSummonerMatchesType = Awaited<ReturnType<typeof $getSummonerMatches>>;
