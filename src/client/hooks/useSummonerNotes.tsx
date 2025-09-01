import { $getSummonerNotes } from "@/server/functions/$getSummonerNotes";
import { useQuery } from "@tanstack/react-query";
import { useRouteContext, useLoaderData } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

const getSummonerNotesKey = (summonerName: string, puuid: string) =>
  ["summoner-notes", summonerName, puuid] as const;

export const useSummonerNotes = () => {
  const { user } = useRouteContext({ from: "__root__" });
  const { summoner } = useLoaderData({ from: "/lol/summoner/$riotID" });

  const _$getSummonerNotes = useServerFn($getSummonerNotes);

  return useQuery({
    queryKey: getSummonerNotesKey(summoner.displayRiotId, summoner.puuid),
    queryFn: () => _$getSummonerNotes({ data: { puuid: summoner.puuid } }),
    enabled: !!user,
  });
};
