import { SummonerNavigationItem } from "@/client/components/summoner/navigation/SummonerNavigationItem";
import { useParams, useSearch } from "@tanstack/react-router";
import { ChartNoAxesCombined, Zap } from "lucide-react";

type Props = {};

export const SummonerNavigation = ({}: Props) => {
  const search = useSearch({ from: "/lol/summoner/$riotID" });
  const params = useParams({ from: "/lol/summoner/$riotID" });

  return (
    <div className={"flex flex-col w-full justify-center items-center"}>
      <div className={"flex bg-neutral-900 p-2 rounded-md gap-2"}>
        <SummonerNavigationItem
          to={"/lol/summoner/$riotID"}
          search={search}
          params={params}
        >
          <ChartNoAxesCombined />
          Profile
        </SummonerNavigationItem>
        <SummonerNavigationItem
          to={"/lol/summoner/$riotID/matches"}
          search={search}
          params={params}
        >
          <ChartNoAxesCombined />
          Matches
        </SummonerNavigationItem>
        <SummonerNavigationItem
          to={"/lol/summoner/$riotID/refresh"}
          search={search}
          params={params}
        >
          <Zap />
          Refresh
        </SummonerNavigationItem>
      </div>
    </div>
  );
};
