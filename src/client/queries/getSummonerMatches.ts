import { friendlyQueueTypeToRiot, type FriendlyQueueType } from "@/client/lib/typeHelper";
import type { ChampionsResponseType } from "@/client/services/DDragon/types";
import type { SummonerType } from "@/server/db/schema";
import { $getSummonerMatches } from "@/server/functions/$getSummonerMatches";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useLoaderData } from "@tanstack/react-router";

type QueryParams = {
  summoner: Pick<SummonerType, "puuid" | "region">;
  queue: FriendlyQueueType;
};

export const getSummonerMatchesOptions = (
  { summoner, queue }: QueryParams,
  c: string,
  champions: ChampionsResponseType["data"],
) =>
  queryOptions({
    queryKey: ["getSummonerMatchesOptions", summoner.puuid, queue, summoner.region],
    queryFn: () =>
      $getSummonerMatches({
        data: {
          puuid: summoner.puuid,
          region: summoner.region,
          queue: friendlyQueueTypeToRiot(queue),
        },
      }),
    select: (data) => {
      if (c) {
        console.log({ c });

        return data.matches.filter((m) => {
          const championName = champions[m.match_summoner.championId]!.name.toUpperCase();

          return championName.startsWith(c);
        });
      }

      return data.matches;
    },
  });

export const useGetSummonerMatches = (params: QueryParams, c: string) => {
  const { champions } = useLoaderData({ from: "/lol" });

  return useQuery(getSummonerMatchesOptions(params, c, champions));
};

export type GetSummonerMatchesType = Awaited<ReturnType<typeof $getSummonerMatches>>;
