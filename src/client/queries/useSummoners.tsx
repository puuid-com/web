import type { SummonerType } from "@puuid/core/server/db/schema/summoner";
import {
  $getSummonersByPuuids,
  type $GetSummonersByPuuidsItemType,
} from "@/server/functions/$getSummonersByPuuids";
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

export const getSummonerKey = (puuid: string) => ["useSummonerKey", puuid];

export const useSummonersQueryOptions = (
  puuids: SummonerType["puuid"][],
  userId: string | undefined,
  keyPrefix?: string,
) =>
  queryOptions({
    queryKey: useSummonersQueryKey(puuids, userId, keyPrefix),
    queryFn: async (ctx) => {
      console.log("useSummonersQueryOptions", { puuids });

      if (!puuids.length) return [];

      const cached = puuids
        .map((p) => ctx.client.getQueryData(getSummonerKey(p)))
        .filter(Boolean) as $GetSummonersByPuuidsItemType[];
      const cachedPuuids = cached.map((c) => c.summoner.puuid);

      console.log("\tAlready Cached", { puuids: cachedPuuids });

      const notCached = puuids.filter((p) => !cachedPuuids.includes(p));

      console.log("\tNot cached, fetching", { puuids: notCached });

      if (!notCached.length) {
        console.log("\tAll data was cached, return cached", cached);

        return cached;
      }

      const newData = await $getSummonersByPuuids({
        data: notCached,
      });

      newData.forEach((s) => ctx.client.setQueryData(getSummonerKey(s.summoner.puuid), s));

      return [...newData, ...cached];
    },
  });

export const useSummoners = (
  puuids: SummonerType["puuid"][],
  userId: string | undefined,
  keyPrefix?: string,
) => {
  return useQuery(useSummonersQueryOptions(puuids, userId, keyPrefix));
};
