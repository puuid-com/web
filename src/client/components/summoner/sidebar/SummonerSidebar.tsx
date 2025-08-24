import { SummonerSidebarFilters } from "@/client/components/summoner/sidebar/SummonerSidebarFilters";
import { SummonerSidebarStatsByChampionId } from "@/client/components/summoner/sidebar/SummonerSidebarStatsByChampion";
import { useLoaderData } from "@tanstack/react-router";
import { PawPrintIcon, RatIcon } from "lucide-react";

type Props = {};

export const SummonerSidebar = ({}: Props) => {
  const { queueStats: stats } = useLoaderData({
    from: "/lol/summoner/$riotID",
  });

  return (
    <div className={"flex flex-col gap-10 w-70 sticky self-start basis-70 shrink-0"}>
      <SummonerSidebarFilters />
      <SummonerSidebarStatsByChampionId
        statsByChampionId={stats?.statsByChampionId}
        iconName={PawPrintIcon}
        label={"Stats By Champion"}
      />
      <SummonerSidebarStatsByChampionId
        statsByChampionId={stats?.statsByOppositeIndividualPositionChampionId}
        iconName={RatIcon}
        label={"Stats by Matchup"}
      />
    </div>
  );
};
