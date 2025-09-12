import React from "react";
import { useLoaderData } from "@tanstack/react-router";
import type { $getMatchDetailsType } from "@/server/functions/$getMatchDetails";
import type { GetSummonerMatchesType } from "@/client/queries/getSummonerMatches";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import { CDNService } from "@/shared/services/CDNService";
import { cn } from "@/client/lib/utils";
import { POSITION_INDEXES } from "@/client/components/summoner/live/utils";

type Match = GetSummonerMatchesType["matches"][number];

type Props = {
  match: Match;
  timeline: NonNullable<$getMatchDetailsType>;
  selectedPuuid?: string | null;
  onSelect?: (puuid: string) => void;
};

export const MatchParticipantsSelector: React.FC<Props> = ({
  match,
  timeline,
  selectedPuuid,
  onSelect,
}) => {
  const { champions } = useLoaderData({ from: "__root__" });

  const mapping =
    timeline.info.participants?.reduce((acc: Map<string, number>, p) => {
      acc.set(p.puuid, p.participantId);
      return acc;
    }, new Map<string, number>()) ?? null;

  const participants = match.summoners.map((s) => ({
    puuid: s.puuid,
    gameName: s.gameName,
    tagLine: s.tagLine,
    championId: s.championId,
    participantId: mapping?.get(s.puuid) ?? null,
    teamId: s.teamId,
    position: s.position,
  }));

  const team100 = React.useMemo(
    () =>
      participants
        .filter((p) => p.teamId === 100)
        .sort((a, b) => POSITION_INDEXES[a.position] - POSITION_INDEXES[b.position]),
    [participants],
  );
  const team200 = React.useMemo(
    () =>
      participants
        .filter((p) => p.teamId === 200)
        .sort((a, b) => POSITION_INDEXES[a.position] - POSITION_INDEXES[b.position]),
    [participants],
  );

  return (
    <div className="flex items-center justify-between gap-2 w-full">
      {/* Team 100 */}
      <div className="flex items-center gap-1 min-w-0">
        {team100.map((p) => {
          const isActive = p.puuid === selectedPuuid;
          return (
            <button
              key={p.puuid}
              type="button"
              onClick={() => onSelect?.(p.puuid)}
              className={cn(
                "relative w-10 h-10 rounded-md overflow-hidden ring-1 ring-border/60",
                isActive ? "outline outline-2 outline-main/70" : "hover:ring-border",
              )}
              title={`${p.gameName}#${p.tagLine}`}
            >
              <img
                src={CDragonService.getChampionSquare(p.championId)}
                alt={champions[p.championId]?.name ?? String(p.championId)}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 rounded-sm p-0.5 ring-1 ring-border/50 bg-red-500/60">
                <img
                  src={CDNService.getPositionImageUrl(p.position)}
                  alt=""
                  aria-hidden
                  className="w-3.5 h-3.5"
                />
              </span>
            </button>
          );
        })}
      </div>
      {/* Team 200 */}
      <div className="flex items-center gap-1 justify-end min-w-0">
        {team200.map((p) => {
          const isActive = p.puuid === selectedPuuid;
          return (
            <button
              key={p.puuid}
              type="button"
              onClick={() => onSelect?.(p.puuid)}
              className={cn(
                "relative w-10 h-10 rounded-md overflow-hidden ring-1 ring-border/60",
                isActive ? "outline outline-2 outline-main/70" : "hover:ring-border",
              )}
              title={`${p.gameName}#${p.tagLine}`}
            >
              <img
                src={CDragonService.getChampionSquare(p.championId)}
                alt={champions[p.championId]?.name ?? String(p.championId)}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 rounded-sm p-0.5 ring-1 ring-border/50 bg-blue-500/60">
                <img
                  src={CDNService.getPositionImageUrl(p.position)}
                  alt=""
                  aria-hidden
                  className="w-3.5 h-3.5"
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
