import { POSITION_ORDER, assignAndSortParticipantsByRole } from "@/client/components/summoner/live/utils";
import { cn } from "@/client/lib/utils";
import type { $GetSummonerActiveMatchType } from "@/server/functions/$getSummonerActiveMatch";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import { DDragonService } from "@/shared/services/DDragon/DDragonService";
import { useLoaderData } from "@tanstack/react-router";
import React from "react";

type Props = {
  match: NonNullable<$GetSummonerActiveMatchType>;
  teamId: number;
};

export const SummonerLiveMatchHeaderTeam = ({ match, teamId }: Props) => {
  const metadata = useLoaderData({ from: "/lol" });
  const { championsData, latest_version, summoner_spells } = metadata;

  const participants = React.useMemo(() => {
    return assignAndSortParticipantsByRole(
      match.participants.filter((p) => p.teamId === teamId),
      championsData,
    );
  }, [championsData, match.participants, teamId]);

  const items = participants.map((p, idx) => ({ p, role: POSITION_ORDER[idx]! }));

  const ROLE_LABEL = {
    TOP: "TOP",
    JUNGLE: "JG",
    MIDDLE: "MID",
    BOTTOM: "ADC",
    UTILITY: "SUP",
  } as const;
  type RoleKey = keyof typeof ROLE_LABEL;

  return (
    <div
      className={cn(
        "flex flex-row last:flex-row-reverse rounded-lg p-2 gap-2",
        teamId === 100 ? "bg-red-500/10" : "bg-blue-500/10",
        "ring-1 ring-border/50",
      )}
    >
      <div className={"flex flex-row gap-2"}>
        {items.map(({ p, role }) => {
          const championName = metadata.champions[p.championId]?.name ?? "";
          const s1 = DDragonService.getSummonerSpellIconUrl(summoner_spells, latest_version, p.spell1Id);
          const s2 = DDragonService.getSummonerSpellIconUrl(summoner_spells, latest_version, p.spell2Id);
          return (
            <div key={p.puuid} className={"flex flex-col items-center gap-1.5 min-w-14"}>
              <div
                className={cn(
                  "text-[10px] px-1 py-0.5 rounded-md font-semibold tracking-wide",
                  teamId === 100
                    ? "bg-red-500/15 text-red-200/90 ring-1 ring-red-500/30"
                    : "bg-blue-500/15 text-blue-200/90 ring-1 ring-blue-500/30",
                )}
                title={role}
              >
                {ROLE_LABEL[role as RoleKey]}
              </div>
              <div className={"relative"}>
                <img
                  className={"w-14 h-14 rounded-md object-cover"}
                  src={CDragonService.getChampionSquare(p.championId)}
                  alt={championName}
                  loading="eager"
                  decoding="async"
                />
                <div className={"absolute bottom-0 right-0 flex gap-0.5 p-0.5"}>
                  <img src={s1} alt="" className={"w-4 h-4 rounded-sm ring-1 ring-border/60"} />
                  <img src={s2} alt="" className={"w-4 h-4 rounded-sm ring-1 ring-border/60"} />
                </div>
              </div>
              <div className={"text-[10px] text-muted-foreground max-w-16 truncate"} title={championName}>
                {championName}
              </div>
            </div>
          );
        })}
      </div>
      <div className={"flex items-center justify-center text-xs text-muted-foreground px-1.5"}>
        <span
          className={cn(
            "px-1.5 py-0.5 rounded-md ring-1",
            teamId === 100
              ? "bg-red-500/10 ring-red-500/40 text-red-200/90"
              : "bg-blue-500/10 ring-blue-500/40 text-blue-200/90",
          )}
        >
          {teamId === 100 ? "Red Side" : "Blue Side"}
        </span>
      </div>
    </div>
  );
};
