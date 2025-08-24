import { MatchItemChampionName } from "@/client/components/match-list/MatchItemChampionName";
import { SummonerSidebarStats } from "@/client/components/summoner/sidebar/SummonerSidebarStats";
import { SummonerSidebarStatsHeader } from "@/client/components/summoner/sidebar/SummonerSidebarStatsHeader";
import { DDragonService } from "@/client/services/DDragon";
import type { StatsByChampionId } from "@/server/db/schema";
import { useLoaderData, useSearch } from "@tanstack/react-router";
import { type LucideIcon } from "lucide-react";
import React from "react";

type Props = {
  statsByChampionId: StatsByChampionId | undefined;
  label: string;
  iconName: LucideIcon;
};

export const SummonerSidebarStatsByChampionId = ({
  statsByChampionId: stats,
  iconName,
  label,
}: Props) => {
  const metadata = useLoaderData({ from: "/lol" });
  const c = useSearch({
    from: "/lol/summoner/$riotID/matches",
    select: (s) => s.c,
  });

  const _data = React.useMemo(() => {
    const _c = c?.toUpperCase();

    if (!c || !stats) return stats;

    return stats.filter((s) => {
      const championName = metadata.champions[s.championId]!.name;

      return championName.toUpperCase().startsWith(_c ?? "");
    });
  }, [c, metadata.champions, stats]);

  return (
    <SummonerSidebarStats>
      <SummonerSidebarStatsHeader iconName={iconName}>{label}</SummonerSidebarStatsHeader>
      {_data?.map((s) => {
        const championName = DDragonService.getChampionName(metadata.champions, s.championId);
        const championUrl = DDragonService.getChampionIconUrlFromParticipant(
          metadata.champions,
          metadata.latest_version,
          s,
        );

        return (
          <div
            key={`statsByChampionId-#${s.championId}`}
            className={"flex gap-2.5 items-center justify-between px-2 py-1"}
          >
            <div className={"flex gap-1 items-center"}>
              <img
                className={"w-8 rounded-full"}
                src={championUrl}
                alt={`${championName} profil icon`}
              />
              <MatchItemChampionName championId={s.championId} />
            </div>
            <div className={"leading-none text-end"}>
              <div className={"text-xs"}>
                {`${((s.wins / (s.wins + s.losses)) * 100).toFixed(0)}% `}
                <span className={"text-neutral-400 text-tiny"}>WR</span>
              </div>
              <div className={"text-xs text-neutral-400"}>{s.wins + s.losses} matches</div>
            </div>
          </div>
        );
      })}
    </SummonerSidebarStats>
  );
};
