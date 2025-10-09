import { SummonerSidebarStats } from "@/client/components/summoner/sidebar/SummonerSidebarStats";
import { SummonerSidebarStatsHeader } from "@/client/components/summoner/sidebar/SummonerSidebarStatsHeader";
import { Skeleton } from "@/client/components/ui/skeleton";
import { useSummonerFilter, type MatchesSearchKey } from "@/client/hooks/useSummonerFilter";
import { WinrateBadge } from "@/client/components/summoner/WinrateBadge";
import { cn } from "@/client/lib/utils";
import { useSummoners } from "@/client/queries/useSummoners";
import type { StatsByTeammate } from "@puuid/core/server/db/schema/summoner-statistic";
import type { SummonerType } from "@puuid/core/server/db/schema/summoner";
import { CDragonService } from "@puuid/core/shared/services/CDragonService";
import { useRouteContext } from "@tanstack/react-router";
import { type LucideIcon } from "lucide-react";
import React from "react";

type Props = {
  statsByChampionId: StatsByTeammate | undefined;
  label: string;
  iconName: LucideIcon;
  searchKey: MatchesSearchKey;
};

export const SummonerSidebarStatsByPuuid = ({
  statsByChampionId: stats,
  iconName,
  label,
  searchKey,
}: Props) => {
  const { user } = useRouteContext({ from: "__root__" });
  const { handleOnFilterClickEvent, isEqualToFilterValue } = useSummonerFilter(searchKey);

  const { data: summoners } = useSummoners(stats?.map((s) => s.puuid) ?? [], user?.id);

  const _data = React.useMemo<
    {
      summoner: SummonerType | null;
      stats: StatsByTeammate[number];
    }[]
  >(() => {
    if (!stats?.length || !summoners) return [];

    return stats.map((s) => {
      const summoner = summoners.find((s2) => s.puuid === s2.summoner.puuid)?.summoner;

      return {
        summoner: summoner ?? null,
        stats: s,
      };
    });
  }, [stats, summoners]);

  return (
    <SummonerSidebarStats>
      <SummonerSidebarStatsHeader iconName={iconName}>{label}</SummonerSidebarStatsHeader>
      {_data.map(({ summoner, stats: s }) => {
        const profileIconUrl = summoner
          ? CDragonService.getProfileIcon(summoner.profileIconId)
          : null;
        const displayRiotId = summoner?.displayRiotId;
        const totalMatches = s.wins + s.losses;
        const winrate = totalMatches > 0 ? (s.wins / totalMatches) * 100 : 0;

        return (
          <button
            key={`statsByChampionId-#${s.puuid}`}
            className={"flex gap-2.5 items-center justify-between px-2 py-1"}
            onClick={handleOnFilterClickEvent(s.puuid)}
          >
            <div className={"flex gap-1 items-center"}>
              {profileIconUrl ? (
                <img
                  className={"w-8 rounded-full"}
                  src={profileIconUrl}
                  alt={`${displayRiotId} profil icon`}
                />
              ) : (
                <Skeleton className={"w-8 h-8 rounded-full"} />
              )}
              <div>
                {displayRiotId ? (
                  <span
                    className={cn(
                      "font-bold",
                      isEqualToFilterValue(s.puuid) ? "text-main" : undefined,
                    )}
                  >
                    {displayRiotId}
                  </span>
                ) : (
                  <Skeleton className={"w-[16ch] h-4"} />
                )}
              </div>
            </div>
            <div className={"leading-none text-end"}>
              <WinrateBadge value={winrate} showLabel className="text-xs" />
              <div className={"text-xs text-neutral-400"}>{totalMatches} matches</div>
            </div>
          </button>
        );
      })}
    </SummonerSidebarStats>
  );
};
