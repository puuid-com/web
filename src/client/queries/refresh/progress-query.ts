import {
  queryOptions,
  experimental_streamedQuery as streamedQuery,
} from "@tanstack/react-query";
import { progressAnswer } from "./progress-answer";
import type { SimpleProgressMsg } from "@/server/functions/$streamSimpleProgress";

type Args = { puuid: string; region: string; queue: string };

export const progressQueryOptions = (args: Args) =>
  queryOptions({
    queryKey: [
      "summoner-progress",
      args.puuid,
      args.region,
      args.queue,
    ] as const,
    queryFn: streamedQuery<SimpleProgressMsg>({
      queryFn: ({ signal }) => progressAnswer(args, signal),
      refetchMode: "reset",
    }),
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
  });
