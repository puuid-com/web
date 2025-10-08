import { SummonerSidebarStatsByChampionId } from "@/client/components/summoner/sidebar/SummonerSidebarStatsByChampion";
import { SummonerSidebarStatsByPuuid } from "@/client/components/summoner/sidebar/SummonerSidebarStatsByPuuid";
import { SummonerSidebarStatsRank } from "@/client/components/summoner/sidebar/SummonerSidebarStatsRank";
import { useLoaderData } from "@tanstack/react-router";
import { PawPrintIcon, RatIcon, Users } from "lucide-react";

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
