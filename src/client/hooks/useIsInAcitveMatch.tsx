import type { SummonerType } from "@/server/db/schema/summoner";
import { $isInActiveMatch } from "@/server/functions/$checkActiveMatch";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

export const getIsInActiveMatchKey = (summoner: Pick<SummonerType, "puuid" | "region">) =>
  ["useIsInAcitveMatch", summoner.puuid, summoner.region] as const;

export const useIsInAcitveMatch = ({ puuid, region }: Pick<SummonerType, "puuid" | "region">) => {
  const $fn = useServerFn($isInActiveMatch);

  const { data } = useQuery({
    queryKey: getIsInActiveMatchKey({ puuid, region }),
    queryFn: () =>
      $fn({
        data: {
          puuid: puuid,
          region: region,
        },
      }),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,

    placeholderData: keepPreviousData,
  });

  return !!data;
};
