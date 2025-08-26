import { SummonerNavigationItem } from "@/client/components/summoner/navigation/SummonerNavigationItem";
import { useParams } from "@tanstack/react-router";
import {
  BarChart2Icon,
  CrownIcon,
  DatabaseBackupIcon,
  RadioIcon,
  ScrollTextIcon,
} from "lucide-react";

type Props = {};

export const SummonerNavigation = ({}: Props) => {
  const params = useParams({ from: "/lol/summoner/$riotID" });

  return (
    <div className={"flex gap-2.5"}>
      <SummonerNavigationItem
        to={"/lol/summoner/$riotID/matches"}
        params={params}
        search={{
          q: "solo",
        }}
        iconNode={ScrollTextIcon}
      >
        Matches
      </SummonerNavigationItem>
      <SummonerNavigationItem
        to={"/lol/summoner/$riotID/mastery"}
        params={params}
        iconNode={CrownIcon}
        search={{
          queue: "solo",
        }}
        activeOptions={{ includeSearch: false }}
      >
        Masteries
      </SummonerNavigationItem>
      <SummonerNavigationItem
        to={"/lol/summoner/$riotID/statistics"}
        params={params}
        iconNode={BarChart2Icon}
        search={{
          queue: "solo",
        }}
        activeOptions={{ includeSearch: false }}
      >
        Statistics
      </SummonerNavigationItem>
      <SummonerNavigationItem
        to={"/lol/summoner/$riotID/live"}
        params={params}
        iconNode={RadioIcon}
      >
        Live
      </SummonerNavigationItem>
      <SummonerNavigationItem
        to={"/lol/summoner/$riotID/refresh"}
        params={params}
        iconNode={DatabaseBackupIcon}
      >
        Refresh
      </SummonerNavigationItem>
    </div>
  );
};
