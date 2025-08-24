import { SummonerNavigationItem } from "@/client/components/summoner/navigation/SummonerNavigationItem";
import { useParams } from "@tanstack/react-router";
import { CrownIcon, DatabaseBackupIcon, ScrollTextIcon } from "lucide-react";

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
      >
        Masteries
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
