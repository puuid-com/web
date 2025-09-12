import { $getMatchDetails } from "@/server/functions/$getMatchDetails";
import { queryOptions, useQuery } from "@tanstack/react-query";

type QueryParams = {
  matchId: string;
};

export const getMatchDetailsKey = (params: QueryParams) =>
  ["getMatchDetails", params.matchId] as const;

export const getMatchDetailsOptions = (params: QueryParams) =>
  queryOptions({
    queryKey: getMatchDetailsKey(params),
    queryFn: () => $getMatchDetails({ data: { matchId: params.matchId } }),
  });

export const useGetMatchDetails = (params: QueryParams, opts?: { enabled?: boolean }) => {
  return useQuery({ ...getMatchDetailsOptions(params), enabled: opts?.enabled });
};

export type GetMatchDetailsType = Awaited<ReturnType<typeof $getMatchDetails>>;
