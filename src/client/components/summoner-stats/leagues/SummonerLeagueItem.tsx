import type { LeagueHistoryType } from "@/server/services/league/type";

type Props = {
  league: LeagueHistoryType | undefined;
};

export const SummonerLeagueItem = ({ league }: Props) => {
  return (
    <div>
      {league && (
        <div>
          <h2>{league.lastest.tier}</h2>
          <p>LP: {league.lastest.leaguePoints}</p>
          <p>Wins: {league.lastest.wins}</p>
          <p>Losses: {league.lastest.losses}</p>
        </div>
      )}
    </div>
  );
};
