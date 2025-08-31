import { normalizeRiotID } from "@/lib/riotID";
import { $getSummonerByRiotID } from "@/server/functions/$getSummonerByRiotID";
import { $getSummonerMasteries } from "@/server/functions/$getSummonerMasteries";
import { keepPreviousData, queryOptions, useSuspenseQuery } from "@tanstack/react-query";

type QueryParams = {
  riotID: string;
};

export const getSummonerByRiotIDOptions = ({ riotID }: QueryParams) =>
  queryOptions({
    queryKey: ["getSummonerByRiotIDOptions", normalizeRiotID(riotID)],
    queryFn: () => $getSummonerByRiotID({ data: riotID }),

    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,

    // garder l’ancienne data pendant le changement de param
    placeholderData: keepPreviousData,
  });

export const useGetSummonerByRiotID = (params: QueryParams) => {
  return useSuspenseQuery(getSummonerByRiotIDOptions(params));
};

export type GetSummonerByRiotIDType = Awaited<ReturnType<typeof $getSummonerMasteries>>;
