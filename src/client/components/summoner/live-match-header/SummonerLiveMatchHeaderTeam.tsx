import {
  POSITION_ORDER,
  assignAndSortParticipantsByRole,
} from "@/client/components/summoner/live/utils";
import { cn } from "@/client/lib/utils";
import type { $GetSummonerActiveMatchType } from "@/server/functions/$getSummonerActiveMatch";
import { DDragonService } from "@puuid/core/shared/services/DDragonService";
import { useLoaderData } from "@tanstack/react-router";
import { ChampionTile } from "@/client/components/summoner/live-match-header/ChampionTile";
import React from "react";

type Props = {
  match: NonNullable<$GetSummonerActiveMatchType>;
  teamId: number;
};

export const SummonerLiveMatchHeaderTeam = ({ match, teamId }: Props) => {
  const metadata = useLoaderData({ from: "__root__" });
  const { summoner } = useLoaderData({ from: "/lol/summoner/$riotID" });
  const { championsData, latest_version, summoner_spells } = metadata;

  const participants = React.useMemo(() => {
    return assignAndSortParticipantsByRole(
      match.participants.filter((p) => p.teamId === teamId),
      championsData,
    );
  }, [championsData, match.participants, teamId]);

  const items = participants.map((p, idx) => ({ p, role: POSITION_ORDER[idx]! }));

  return (
    <div
      className={cn(
        "flex flex-row last:flex-row-reverse rounded-lg p-2 gap-2",
        teamId === 100 ? "bg-red-500/25" : "bg-blue-500/25",
        "ring-1 ring-border/60",
      )}
    >
      <div className={"flex flex-row gap-2"}>
        {items.map(({ p, role }) => {
          const championName = metadata.champions[p.championId]?.name ?? "";
          const s1 = DDragonService.getSummonerSpellIconUrl(
            summoner_spells,
            latest_version,
            p.spell1Id,
          );
          const s2 = DDragonService.getSummonerSpellIconUrl(
            summoner_spells,
            latest_version,
            p.spell2Id,
          );
          const isSelf = p.summoner.puuid === summoner.puuid;
          return (
            <ChampionTile
              key={p.puuid}
              championId={p.championId}
              championName={championName}
              spell1Url={s1}
              spell2Url={s2}
              role={role}
              teamId={teamId}
              isSelf={isSelf}
            />
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
