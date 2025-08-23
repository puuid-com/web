import { MatchListItem } from "@/client/components/match-list/MatchListItem";
import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";
import type { SummonerType } from "@/server/db/schema";
import React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useGetSummonerMatches } from "@/client/queries/getSummonerMatches";
import { MatchListContent } from "@/client/components/match-list/MatchListContent";
import LoadingScreen from "@/client/components/Loading";

type Props = {
  queue: LolQueueType;
  summoner: SummonerType;
};

export const MatchList = ({ queue, summoner }: Props) => {
  const q_matches = useGetSummonerMatches({
    queue: queue,
    summoner: summoner,
  });

  if (q_matches.status === "pending") {
    return <LoadingScreen />;
  } else if (q_matches.status === "error") {
    return (
      <div>
        <h1>Error :/</h1>
        <p>{q_matches.error.message}</p>
      </div>
    );
  }

  return (
    <MatchListContent matches={q_matches.data.matches} summoner={summoner} />
  );
};
