import { $getSummonerMasteries } from "@/server/functions/$getSummonerMasteries";
import { $getUserSession } from "@/server/functions/$getUserSession";
import { keepPreviousData, queryOptions, useSuspenseQuery } from "@tanstack/react-query";

export const getUserSessionOptions = () =>
  queryOptions({
    queryKey: ["getUserSessionOptions"],
    queryFn: () => $getUserSession(),

    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,

    // garder l’ancienne data pendant le changement de param
    placeholderData: keepPreviousData,
  });

export const useGetUserSession = () => {
  return useSuspenseQuery(getUserSessionOptions());
};

export type GetUserSessionOptionsType = Awaited<ReturnType<typeof $getSummonerMasteries>>;
