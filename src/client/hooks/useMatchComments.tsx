import { useMatchContext } from "@/client/context/MatchContext";
import { $getMatchComments } from "@/server/functions/$getMatchComments";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

export const getMatchCommentsKey = (matchId: string) => ["getMatchCommentsKey", matchId] as const;

export const useMatchComments = () => {
  const { match } = useMatchContext();

  const $fn = useServerFn($getMatchComments);

  return useQuery({
    queryKey: getMatchCommentsKey(match.matchId),
    queryFn: () => $fn({ data: { matchId: match.matchId } }),
  });
};
