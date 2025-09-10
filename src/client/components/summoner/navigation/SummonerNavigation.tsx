import { LiveMatchIcon } from "@/client/components/icons/LiveMatchIcon";
import { SummonerFollowButton } from "@/client/components/summoner/header/SummonerFollowButton";
import { SummonerNotesDialog } from "@/client/components/summoner/header/SummonerNotesDialog";
import { SummonerQueueSelect } from "@/client/components/summoner/header/SummonerQueueSelect";
import { SummonerNavigationItem } from "@/client/components/summoner/navigation/SummonerNavigationItem";
import { cn } from "@/client/lib/utils";
import { useParams, useRouteContext, useSearch } from "@tanstack/react-router";
import { ChartScatterIcon, CrownIcon, ScrollTextIcon } from "lucide-react";

type Props = {
  className?: React.ComponentProps<"div">["className"];
};

export const SummonerNavigation = ({ className }: Props) => {
  const params = useParams({ from: "/lol/summoner/$riotID" });
  const { user } = useRouteContext({ from: "__root__" });
  const search = useSearch({ from: "/lol/summoner/$riotID" });

  return (
    <div className={cn("flex gap-2.5 items-center", className)}>
      <SummonerQueueSelect />
      <SummonerNavigationItem
        to={"/lol/summoner/$riotID/matches"}
        params={params}
        search={search}
        iconNode={ScrollTextIcon}
      >
        Matches
      </SummonerNavigationItem>
      <SummonerNavigationItem
        to={"/lol/summoner/$riotID/mastery"}
        params={params}
        search={search}
        iconNode={CrownIcon}
        activeOptions={{ includeSearch: false }}
      >
        Masteries
      </SummonerNavigationItem>
      <SummonerNavigationItem
        to={"/lol/summoner/$riotID/charts"}
        search={search}
        params={params}
        iconNode={ChartScatterIcon}
        activeOptions={{ includeSearch: false }}
      >
        Charts
      </SummonerNavigationItem>
      <SummonerNavigationItem
        to={"/lol/summoner/$riotID/live"}
        search={search}
        params={params}
        iconNode={LiveMatchIcon}
      >
        Live
      </SummonerNavigationItem>
      {user ? (
        <div className={"flex gap-2.5 ml-auto items-center"}>
          <SummonerNotesDialog />
          <SummonerFollowButton />
        </div>
      ) : null}
    </div>
  );
};
