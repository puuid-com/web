import { assignAndSortParticipantsByRole } from "@/client/components/summoner/live/utils";
import { cn } from "@/client/lib/utils";
import type { $GetSummonerActiveMatchType } from "@/server/functions/$getSummonerActiveMatch";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import { useLoaderData } from "@tanstack/react-router";
import React from "react";

type Props = {
  match: NonNullable<$GetSummonerActiveMatchType>;
  teamId: number;
};

export const SummonerLiveMatchHeaderTeam = ({ match, teamId }: Props) => {
  const { championsData } = useLoaderData({ from: "/lol" });

  const participants = React.useMemo(() => {
    return assignAndSortParticipantsByRole(
      match.participants.filter((p) => p.teamId === teamId),
      championsData,
    );
  }, [championsData, match.participants, teamId]);

  return (
    <div
      className={cn(
        "flex flex-row last:flex-row-reverse rounded-md p-1.5 gap-1.5",
        teamId === 100 ? "bg-red-500/10" : "bg-blue-500/10",
      )}
    >
      <div className={"flex flex-row gap-1.5"}>
        {participants.map((p) => {
          return (
            <div>
              <img
                className={"w-12 aspect-square rounded-md"}
                src={CDragonService.getChampionSquare(p.championId)}
                alt=""
              />
            </div>
          );
        })}
      </div>
      <div className={"flex items-center justify-center"}>
        {teamId === 100 ? "Red Side" : "Blue Side"}
      </div>
    </div>
  );
};
