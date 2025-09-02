import { $getFeaturedMatches } from "@/server/functions/$getFeaturedMatches";
import { $getSummonerActiveMatch } from "@/server/functions/$getSummonerActiveMatch";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/lol/live")({
  component: RouteComponent,
  loader: async () => {
    const featuredGames = await $getFeaturedMatches({
      data: "euw1",
    });

    const _puuid = featuredGames.gameList
      .find((g) => g.gameQueueConfigId === 420)
      ?.participants.at(0)?.puuid;

    if (!_puuid) {
      throw new Error("No puuid");
    }

    const liveGame = await $getSummonerActiveMatch({
      data: {
        puuid: _puuid,
        region: "euw1",
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

  const riotID = liveGame.participants.at(0)!.summoner.displayRiotId;

  return (
    <div className={"justify-center w-full flex flex-col"}>
      <div></div>
      <div className={"justify-center w-full flex flex-row"}>
        <Link to={"/lol/summoner/$riotID/live"} params={{ riotID: riotID }}>
          {riotID}
        </Link>
      </div>
    </div>
  );
}
