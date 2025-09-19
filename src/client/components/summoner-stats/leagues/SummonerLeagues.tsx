import { SummonerLeagueItem } from "@/client/components/summoner-stats/leagues/SummonerLeagueItem";
import type { LeaguesType } from "@puuid/core/server/services/league/type";

type Props = {
  leagues: LeaguesType;
};

export const SummonerLeagues = ({ leagues }: Props) => {
  return (
    <div>
      <div>
        <h1>SummonerStats -- League</h1>
      </div>
      <div className={"flex gap-5 justify-between"}>
        <SummonerLeagueItem league={leagues.RANKED_SOLO_5x5} />
        <SummonerLeagueItem league={leagues.RANKED_FLEX_SR} />
      </div>
    </div>
  );
};
