import { MatchItemChampionName } from "@/client/components/match-list/match-item/MatchItemChampionName";
import { SummonerSidebarStats } from "@/client/components/summoner/sidebar/SummonerSidebarStats";
import { SummonerSidebarStatsHeader } from "@/client/components/summoner/sidebar/SummonerSidebarStatsHeader";
import { useSummonerFilter, type MatchesSearchKey } from "@/client/hooks/useSummonerFilter";
import { cn } from "@/client/lib/utils";
import type { StatsByChampionId } from "@puuid/core/server/db/schema/summoner-statistic";
import { DDragonService } from "@puuid/core/shared/services/DDragonService";
import { useLoaderData } from "@tanstack/react-router";
import { type LucideIcon } from "lucide-react";

type Props = {
  statsByChampionId: StatsByChampionId | undefined;
  label: string;
  iconName: LucideIcon;
  searchKey: MatchesSearchKey;
};

export const SummonerSidebarStatsByChampionId = ({
  statsByChampionId,
  iconName,
  label,
  searchKey,
}: Props) => {
  const { handleOnFilterClickEvent, isEqualToFilterValue } = useSummonerFilter(searchKey);
  const metadata = useLoaderData({ from: "__root__" });

  return (
    <SummonerSidebarStats>
      <SummonerSidebarStatsHeader iconName={iconName}>{label}</SummonerSidebarStatsHeader>
      {statsByChampionId?.map((s) => {
        const championName = DDragonService.getChampionName(metadata.champions, s.championId);
        const championUrl = DDragonService.getChampionIconUrlFromParticipant(
          metadata.champions,
          metadata.latest_version,
          s,
        );

        return (
          <button
            key={`statsByChampionId-#${s.championId}`}
            data-active={isEqualToFilterValue(s.championId)}
            className={cn(
              "flex gap-2.5 items-center justify-between px-2 py-1 hover:cursor-pointer transition-colors group",
              `[&:is([data-active=true],:hover)]:bg-main/5`,
            )}
            onClick={handleOnFilterClickEvent(s.championId)}
          >
            <div className={"flex gap-1 items-center"}>
              <img
                className={"w-8 rounded-full"}
                src={championUrl}
                alt={`${championName} profil icon`}
              />
              <MatchItemChampionName
                championId={s.championId}
                className={"group-[&:is([data-active=true],:hover)]:text-main"}
              />
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
