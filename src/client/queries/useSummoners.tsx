import type { SummonerType } from "@puuid/core/server/db/schema/summoner";
import { $getSummonersByPuuids } from "@/server/functions/$getSummonersByPuuids";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

export const useSummonersQueryKey = (puuids: SummonerType["puuid"][]) => [
  "summoners",
  puuids.sort(),
];

export const useSummoners = (puuids: SummonerType["puuid"][]) => {
  const $fn = useServerFn($getSummonersByPuuids);

  return useQuery({
    queryKey: useSummonersQueryKey(puuids),
    queryFn: () =>
      $fn({
        data: puuids,
      }),
    enabled: !!puuids.length,
  });
};
