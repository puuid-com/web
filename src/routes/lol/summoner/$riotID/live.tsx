import LoadingScreen from "@/client/components/Loading";
import { SummonerLiveTeam } from "@/client/components/summoner/live/SummonerLiveTeam";
import { getIsInActiveMatchKey, useIsInAcitveMatch } from "@/client/hooks/useIsInAcitveMatch";
import { useSummonerLiveMatch } from "@/client/hooks/useSummonerLiveMatch";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/lol/summoner/$riotID/live")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const { summoner } = useRouteContext({ from: "/lol/summoner/$riotID" });

  const { data: liveGame, status } = useSummonerLiveMatch();
  const isInActiveMatch = useIsInAcitveMatch({
    puuid: summoner.puuid,
    region: summoner.region,
  });

  React.useEffect(() => {
    if (status !== "success") return;

    if (isInActiveMatch !== !!liveGame) {
      queryClient
        .invalidateQueries({
          queryKey: getIsInActiveMatchKey({ puuid: summoner.puuid, region: summoner.region }),
        })
        .catch(console.error);
    }
  }, [isInActiveMatch, liveGame, queryClient, status, summoner.puuid, summoner.region]);

  if (status === "pending") {
    return <LoadingScreen />;
  } else if (status === "error") {
    return <div>An error occured :/</div>;
  }

  if (!liveGame) {
    return <div>No active game</div>;
  }

  return (
    <div className={"justify-center w-full flex flex-col"}>
      <div className={"justify-center w-full flex flex-row"}>
        <SummonerLiveTeam match={liveGame} teamId={100} />
        <SummonerLiveTeam match={liveGame} teamId={200} />
      </div>
    </div>
  );
}
