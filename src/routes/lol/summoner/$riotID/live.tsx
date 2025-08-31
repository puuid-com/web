import { SummonerLiveTeam } from "@/client/components/summoner/live/SummonerLiveTeam";
import { $getSummonerActiveMatch } from "@/server/functions/$getSummonerActiveMatch";
import { createFileRoute } from "@tanstack/react-router";

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
  const { liveGame } = Route.useLoaderData();

  if (!liveGame) {
    return <div>No active game</div>;
  }

  return (
    <div className={"justify-center w-full flex flex-col"}>
      <div></div>
      <div className={"justify-center w-full flex flex-row"}>
        <SummonerLiveTeam match={liveGame} teamId={100} />
        <SummonerLiveTeam match={liveGame} teamId={200} />
      </div>
    </div>
  );
}
