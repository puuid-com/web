import { friendlyQueueTypeToRiot, type FriendlyQueueType } from "@/client/lib/typeHelper";
import { $getSummonerMatches } from "@/server/functions/$getSummonerMatches";
import { queryOptions, useQuery } from "@tanstack/react-query";
import type { SummonerType } from "@/server/db/schema/summoner";

type QueryParams = {
  summoner: Pick<SummonerType, "puuid" | "region">;
  queue: FriendlyQueueType;
};

export const getSummonerMatchesKey = (params: QueryParams) =>
  [
    "getSummonerMatchesOptions",
    params.summoner.puuid,
    params.queue,
    params.summoner.region,
  ] as const;

export const getSummonerMatchesOptions = ({ summoner, queue }: QueryParams) =>
  queryOptions({
    queryKey: getSummonerMatchesKey({ summoner, queue }),
    queryFn: () =>
      $getSummonerMatches({
        data: {
          puuid: summoner.puuid,
          region: summoner.region,
          queue: friendlyQueueTypeToRiot(queue),
        },
      }),
  });

export const useGetSummonerMatches = (params: QueryParams) => {
  return useQuery(getSummonerMatchesOptions(params));
};

export type GetSummonerMatchesType = Awaited<ReturnType<typeof $getSummonerMatches>>;
