import { LiveMatchIcon } from "@/client/components/icons/LiveMatchIcon";
import { SummonerFollowButton } from "@/client/components/summoner/header/SummonerFollowButton";
import { SummonerNotesDialog } from "@/client/components/summoner/header/SummonerNotesDialog";
import { SummonerNavigationItem } from "@/client/components/summoner/navigation/SummonerNavigationItem";
import { cn } from "@/client/lib/utils";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { ChartScatterIcon, CrownIcon, ScrollTextIcon } from "lucide-react";

type Props = {
  className?: React.ComponentProps<"div">["className"];
};

export const SummonerNavigation = ({ className }: Props) => {
  const params = useParams({ from: "/lol/summoner/$riotID" });
  const { user } = useRouteContext({ from: "__root__" });

  return (
    <div className={cn("flex gap-2.5", className)}>
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
        to={"/lol/summoner/$riotID/charts"}
        params={params}
        iconNode={ChartScatterIcon}
        activeOptions={{ includeSearch: false }}
      >
        Charts
      </SummonerNavigationItem>
      <SummonerNavigationItem
        to={"/lol/summoner/$riotID/live"}
        params={params}
        iconNode={LiveMatchIcon}
      >
        Live
      </SummonerNavigationItem>
      {user ? (
        <div className={"flex gap-1.5 ml-auto items-center"}>
          <SummonerNotesDialog />
          <SummonerFollowButton />
        </div>
      ) : null}
    </div>
  );
};
