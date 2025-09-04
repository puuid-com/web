import { SummonerSidebarStats } from "@/client/components/summoner/sidebar/SummonerSidebarStats";
import { SummonerSidebarStatsHeader } from "@/client/components/summoner/sidebar/SummonerSidebarStatsHeader";
import { Skeleton } from "@/client/components/ui/skeleton";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import { type LucideIcon } from "lucide-react";
import React from "react";
import type { StatsByTeammate } from "@/server/db/schema/summoner-statistic";
import type { SummonerType } from "@/server/db/schema/summoner";
import { cn } from "@/client/lib/utils";
import { useSummonerFilter, type MatchesSearchKey } from "@/client/hooks/useSummonerFilter";
import { useSummoners } from "@/client/queries/useSummoners";

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
  const { handleOnFilterClickEvent, isEqualToFilterValue } = useSummonerFilter(searchKey);

  const { data: summoners } = useSummoners(stats?.map((s) => s.puuid) ?? []);

  const _data = React.useMemo<
    {
      summoner: SummonerType | null;
      stats: StatsByTeammate[number];
    }[]
  >(() => {
    if (!stats?.length) return [];

    return stats.map((s) => {
      const summoner = summoners?.find((s2) => s2.puuid === s.puuid);

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
              <div className={"text-xs"}>
                {`${((s.wins / (s.wins + s.losses)) * 100).toFixed(0)}% `}
                <span className={"text-neutral-400 text-tiny"}>WR</span>
              </div>
              <div className={"text-xs text-neutral-400"}>{s.wins + s.losses} matches</div>
            </div>
          </button>
        );
      })}
    </SummonerSidebarStats>
  );
};
