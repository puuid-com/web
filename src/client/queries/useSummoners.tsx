import type { SummonerType } from "@puuid/core/server/db/schema/summoner";
import { $getSummonersByPuuids } from "@/server/functions/$getSummonersByPuuids";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const useSummonersQueryKey = (
  puuids: SummonerType["puuid"][],
  userId: string | undefined,
  keyPrefix?: string,
) => {
  const key = ["summoners", [...puuids].sort()];

  if (userId) key.push(userId);
  if (keyPrefix) key.push(keyPrefix);

  return key;
};

export const useSummonersQueryOptions = (
  puuids: SummonerType["puuid"][],
  userId: string | undefined,
  keyPrefix?: string,
) =>
  queryOptions({
    queryKey: useSummonersQueryKey(puuids, userId, keyPrefix),
    queryFn: () => {
      if (!puuids.length) return [];

      return $getSummonersByPuuids({
        data: puuids,
      });
    },
  });

export const useSummoners = (
  puuids: SummonerType["puuid"][],
  userId: string | undefined,
  keyPrefix?: string,
) => {
  return useQuery(useSummonersQueryOptions(puuids, userId, keyPrefix));
};
