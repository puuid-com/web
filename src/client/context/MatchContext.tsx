import type { MatchSummonerRowType, MatchWithSummonersType } from "@/server/db/schema/match";
import React from "react";

type ContextType = {
  match: MatchWithSummonersType;
  matchSummoner: MatchSummonerRowType;
  index: number;
  count: number;
  getMatchSummonerTeammates: () => MatchSummonerRowType[];
};

const context = React.createContext<ContextType>({} as ContextType);

// eslint-disable-next-line react-refresh/only-export-components
export const useMatchContext = () => {
  const _context = React.useContext(context);

  return _context;
};

type Props = {
  match: MatchWithSummonersType;
  matchSummoner: MatchSummonerRowType;
  index: number;
  count: number;
};

export const MatchProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  match,
  matchSummoner,
  index,
  count,
}) => {
  const getMatchSummonerTeammates = React.useCallback(() => {
    return match.summoners.filter(
      (s) => s.teamId === matchSummoner.teamId && s.puuid !== matchSummoner.puuid,
    );
  }, [match.summoners, matchSummoner.puuid, matchSummoner.teamId]);

  const value = React.useMemo<ContextType>(() => {
    return {
      match,
      matchSummoner,
      index,
      count,
      getMatchSummonerTeammates,
    };
  }, [match, matchSummoner, index, count, getMatchSummonerTeammates]);

  return <context.Provider value={value}>{children}</context.Provider>;
};
