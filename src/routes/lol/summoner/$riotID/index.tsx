import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { MatchList } from "@/client/components/match-list/MatchList";
import { SummonerNeverFetchedNotice } from "@/client/components/summoner/NoRefreshPage";
import { PawPrintIcon, RatIcon } from "lucide-react";
import { SummonerSidebarStatsByChampionId } from "@/client/components/summoner/sidebar/SummonerSidebarStatsByChampion";

export const Route = createFileRoute("/lol/summoner/$riotID/")({
  component: RouteComponent,
  loader: (ctx) => {},
});

function RouteComponent() {
  const { summoner, stats } = useLoaderData({ from: "/lol/summoner/$riotID" });
  const { queue } = Route.useSearch();

  const metadata = useLoaderData({ from: "/lol" });

  if (!stats) {
    return (
      <div>
        <SummonerNeverFetchedNotice summoner={summoner} queue={queue} />
      </div>
    );
  }

  return (
    <div className={"flex gap-10 relative"}>
      <div className={"flex flex-col gap-10 w-70 sticky top-1000"}>
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
      <div className={"flex flex-1"}>
        <MatchList summoner={summoner} queue={queue} />
      </div>
    </div>
  );
}
