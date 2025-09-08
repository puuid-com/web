import { queryOptions, experimental_streamedQuery as streamedQuery } from "@tanstack/react-query";
import { progressAnswer } from "./progress-answer";
import type { RefreshProgressMsgType } from "@/server/services/RefreshService";
import type { LolRegionType } from "@/server/types/riot/common";
import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";

type Args = { puuid: string; region: LolRegionType; queue: LolQueueType };

export const progressQueryOptions = (args: Args) =>
  queryOptions({
    queryKey: ["summoner-progress", args.puuid, args.region, args.queue] as const,
    queryFn: streamedQuery<RefreshProgressMsgType>({
      streamFn: ({ signal }) => {
        try {
          return progressAnswer(args, signal);
        } catch (e) {
          console.error(e);

          throw e;
        }
      },
      refetchMode: "reset",
    }),
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
  });
