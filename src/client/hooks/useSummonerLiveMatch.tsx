import type { SummonerType } from "@puuid/core/server/db/schema/summoner";
import { $getSummonerActiveMatch } from "@/server/functions/$getSummonerActiveMatch";
import { useQuery } from "@tanstack/react-query";
import { useLoaderData } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

const useSummonerLiveMatchKey = (summoner: Pick<SummonerType, "puuid" | "region">) => [
  "useSummonerLiveMatch",
  summoner.puuid,
  summoner.region,
];

export const useSummonerLiveMatch = () => {
  const { summoner } = useLoaderData({ from: "/lol/summoner/$riotID" });
  const $fn = useServerFn($getSummonerActiveMatch);

  return useQuery({
    queryKey: useSummonerLiveMatchKey(summoner),
    queryFn: () =>
      $fn({
        data: {
          puuid: summoner.puuid,
          region: summoner.region,
        },
      }),
  });
};
