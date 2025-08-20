import { SummonerLeagues } from "@/client/components/summoner-stats/leagues/SummonerLeagues";
import { useGetSummonerStats } from "@/client/queries/getSummonerStats";
import { DDragonService } from "@/client/services/DDragon";
import type { QueueType } from "@/server/api-route/riot/league/LeagueDTO";
import type { SummonerType } from "@/server/db/schema";
import { useLoaderData } from "@tanstack/react-router";

type Props = {
  queue: QueueType;
  summoner: SummonerType;
};

export const SummonerStats = ({ queue, summoner }: Props) => {
  const metadata = useLoaderData({ from: "/lol" });

  const { data, error, status } = useGetSummonerStats({ queue, summoner });

  if (status === "pending") {
    return <div>Loading ...</div>;
  } else if (status === "error") {
    return (
      <div>
        <h1>Error :/</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className={"flex flex-col gap-5"}>
      <SummonerLeagues leagues={data.leagues} />
      <div>
        <div>
          <h1>SummonerStats -- Matches by Champions</h1>
        </div>
        <div>
          {data.statsByChampionId.map((c) => {
            const champion = metadata.champions[c.championId]!;
            const championName = champion.name;
            const gamesPlayed = c.wins + c.losses;
            const winRate = ((c.wins / gamesPlayed) * 100).toFixed(2);

            return (
              <div key={c.championId} className={"flex gap-2.5 items-center"}>
                <div>
                  <img
                    src={DDragonService.getChampionIconUrl(
                      metadata.latest_version,
                      champion.image.full
                    )}
                    alt=""
                    className={"w-8"}
                  />
                </div>
                <h2>{championName} : </h2>
                <p>Games Played: {gamesPlayed}</p>
                <p>Win Rate: {winRate}%</p>
                <p>Wins: {c.wins}</p>
                <p>Losses: {c.losses}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
