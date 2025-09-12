import { SummonerLiveTeamSummoner } from "@/client/components/summoner/live/summoner/SummonerLiveTeamSummoner";
import { assignAndSortParticipantsByRole } from "@/client/components/summoner/live/utils";
import { cn } from "@/client/lib/utils";
import type { $GetSummonerActiveMatchType } from "@/server/functions/$getSummonerActiveMatch";
import { useLoaderData, useRouteContext } from "@tanstack/react-router";
import React from "react";

type Props = {
  match: NonNullable<$GetSummonerActiveMatchType>;
  teamId: number; // 100 red side, 200 blue side
};

export const SummonerLiveTeam = ({ match, teamId }: Props) => {
  const { summoner } = useRouteContext({ from: "/lol/summoner/$riotID/live" });
  const { championsData } = useLoaderData({ from: "__root__" });
  const side: "red" | "blue" = teamId === 100 ? "red" : "blue";

  const participants = React.useMemo(() => {
    return assignAndSortParticipantsByRole(
      match.participants.filter((p) => p.teamId === teamId),
      championsData,
    );
  }, [championsData, match.participants, teamId]);

  return (
    <div
      data-side={side}
      className={cn(
        "group flex flex-col w-full lg:w-1/2 gap-2 p-2 rounded-xl",
        side === "red" ? "bg-red-500/10" : "bg-blue-500/10",
        "ring-1 ring-border/50",
      )}
    >
      {participants.map((p) => {
        const isSelf = p.summoner.puuid === summoner.puuid;

        return (
          <SummonerLiveTeamSummoner
            key={p.puuid}
            side={side}
            isSelf={isSelf}
            league={p.stats?.league ?? undefined}
            participant={p}
          />
        );
      })}
    </div>
  );
};
