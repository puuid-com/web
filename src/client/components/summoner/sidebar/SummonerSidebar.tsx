import { SummonerSidebarStatsByChampionId } from "@/client/components/summoner/sidebar/SummonerSidebarStatsByChampion";
import { SummonerSidebarStatsByPosition } from "@/client/components/summoner/sidebar/SummonerSidebarStatsByPosition";
import { SummonerSidebarStatsByPuuid } from "@/client/components/summoner/sidebar/SummonerSidebarStatsByPuuid";
import { SummonerSidebarStatsRank } from "@/client/components/summoner/sidebar/SummonerSidebarStatsRank";
import { useLoaderData } from "@tanstack/react-router";
import { PawPrintIcon, RatIcon, SplitIcon, Users } from "lucide-react";

type Props = {};

export const SummonerSidebar = ({}: Props) => {
  const { queueStats: stats } = useLoaderData({
    from: "/lol/summoner/$riotID",
  });

  return (
    <div className={"hidden xl:flex flex-col gap-5 w-70 sticky self-start basis-70 shrink-0"}>
      <SummonerSidebarStatsRank />
      <SummonerSidebarStatsByChampionId
        statsByChampionId={stats?.summonerStatistic?.statsByChampionId}
        iconName={PawPrintIcon}
        label={"Stats By Champion"}
        searchKey={"pc"}
      />
      <SummonerSidebarStatsByPosition
        statsByIndividualPosition={stats?.summonerStatistic?.statsByPosition}
        iconName={SplitIcon}
        label={"Stats by Position"}
        searchKey={"pp"}
      />
      <SummonerSidebarStatsByChampionId
        statsByChampionId={stats?.summonerStatistic?.statsByOppositePositionChampionId}
        iconName={RatIcon}
        label={"Stats by Matchup"}
        searchKey={"mc"}
      />
      <SummonerSidebarStatsByPuuid
        statsByChampionId={stats?.summonerStatistic?.statsByTeammates}
        iconName={Users}
        label={"Stats by Teammates"}
        searchKey={"t"}
      />
    </div>
  );
};
