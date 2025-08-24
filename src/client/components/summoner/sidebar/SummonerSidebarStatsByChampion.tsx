import { SummonerSidebarStats } from "@/client/components/summoner/sidebar/SummonerSidebarStats";
import { SummonerSidebarStatsHeader } from "@/client/components/summoner/sidebar/SummonerSidebarStatsHeader";
import { DDragonService } from "@/client/services/DDragon";
import type { StatsByChampionId } from "@/server/db/schema";
import { useLoaderData } from "@tanstack/react-router";
import { type LucideIcon } from "lucide-react";

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

  return (
    <SummonerSidebarStats>
      <SummonerSidebarStatsHeader iconName={iconName}>
        {label}
      </SummonerSidebarStatsHeader>
      {stats?.map((s) => {
        const championName = DDragonService.getChampionName(
          metadata.champions,
          s.championId
        );
        const championUrl = DDragonService.getChampionIconUrlFromParticipant(
          metadata.champions,
          metadata.latest_version,
          s
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
              <div>{championName}</div>
            </div>
            <div className={"leading-none text-end"}>
              <div className={"text-xs"}>
                {`${((s.wins / (s.wins + s.losses)) * 100).toFixed(0)}% `}
                <span className={"text-neutral-400 text-tiny"}>WR</span>
              </div>
              <div className={"text-xs text-neutral-400"}>
                {s.wins + s.losses} matches
              </div>
            </div>
          </div>
        );
      })}
    </SummonerSidebarStats>
  );
};
