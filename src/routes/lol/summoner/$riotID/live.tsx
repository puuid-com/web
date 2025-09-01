import { SummonerLiveTeam } from "@/client/components/summoner/live/SummonerLiveTeam";
import { getIsInActiveMatchKey, useIsInAcitveMatch } from "@/client/hooks/useIsInAcitveMatch";
import { $getSummonerActiveMatch } from "@/server/functions/$getSummonerActiveMatch";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/lol/summoner/$riotID/live")({
  component: RouteComponent,
  loader: async (ctx) => {
    const summoner = ctx.context.summoner;

    const liveGame = await $getSummonerActiveMatch({
      data: {
        puuid: summoner.puuid,
        region: summoner.region,
      },
    });

    return {
      liveGame,
    };
  },
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const { summoner } = useRouteContext({ from: "/lol/summoner/$riotID" });
  const { liveGame } = Route.useLoaderData();
  const isInActiveMatch = useIsInAcitveMatch({
    puuid: summoner.puuid,
    region: summoner.region,
  });

  React.useEffect(() => {
    if (isInActiveMatch !== !!liveGame) {
    queryClient
        .invalidateQueries({
          queryKey: getIsInActiveMatchKey({ puuid: summoner.puuid, region: summoner.region }),
        })
        .catch(console.error);
    }
  }, [isInActiveMatch, liveGame, queryClient, summoner.puuid, summoner.region]);

  if (!liveGame) {
    return <div>No active game</div>;
  }

  return (
    <div className={"justify-center w-full flex flex-col"}>
      <div>{liveGame.gameQueueConfigId}</div>
      <div className={"justify-center w-full flex flex-row"}>
        <SummonerLiveTeam match={liveGame} teamId={100} />
        <SummonerLiveTeam match={liveGame} teamId={200} />
      </div>
    </div>
  );
}
