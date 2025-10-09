import { PositionIcon } from "@/client/components/PositionIcon";
import { SummonerSidebarStats } from "@/client/components/summoner/sidebar/SummonerSidebarStats";
import { SummonerSidebarStatsHeader } from "@/client/components/summoner/sidebar/SummonerSidebarStatsHeader";
import { useSummonerFilter, type MatchesSearchKey } from "@/client/hooks/useSummonerFilter";
import { WinrateBadge } from "@/client/components/summoner/WinrateBadge";
import { cn } from "@/client/lib/utils";
import type { StatsByIndividualPosition } from "@puuid/core/server/db/schema/summoner-statistic";
import { type LucideIcon } from "lucide-react";

type Props = {
  statsByIndividualPosition: StatsByIndividualPosition | undefined;
  label: string;
  iconName: LucideIcon;
  searchKey: MatchesSearchKey;
};

export const SummonerSidebarStatsByPosition = ({
  statsByIndividualPosition: stats,
  iconName,
  label,
  searchKey,
}: Props) => {
  const { handleOnFilterClickEvent, isEqualToFilterValue } = useSummonerFilter(searchKey);

  return (
    <SummonerSidebarStats>
      <SummonerSidebarStatsHeader iconName={iconName}>{label}</SummonerSidebarStatsHeader>
      {stats?.map((s) => {
        const totalMatches = s.wins + s.losses;
        const winrate = totalMatches > 0 ? (s.wins / totalMatches) * 100 : 0;

        return (
          <button
            key={`SummonerSidebarStatsByPosition-#${s.position}`}
            className={cn(
              "flex gap-2.5 items-center justify-between px-2 py-1 hover:cursor-pointer transition-colors group",
              `[&:is([data-active=true],:hover)]:bg-main/5`,
            )}
            onClick={handleOnFilterClickEvent(s.position)}
          >
            <div className="flex items-center gap-2">
              <PositionIcon
                position={s.position}
                className={cn(
                  "h-4 w-4 text-neutral-400 transition-colors",
                  "group-[&:is([data-active=true],:hover)]:text-main",
                  isEqualToFilterValue(s.position) ? "text-main" : undefined,
                )}
                strokeWidth={2.2}
              />
              <span
                className={cn(
                  "font-bold",
                  "group-[&:is([data-active=true],:hover)]:text-main",
                  isEqualToFilterValue(s.position) ? "text-main" : undefined,
                )}
              >
                {s.position}
              </span>
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
