import type { MatchSummonerRowType, MatchWithSummonersType } from "@/server/db/schema/match";
import React from "react";

type ContextType = {
  match: MatchWithSummonersType;
  matchSummoner: MatchSummonerRowType;
  index: number;
  count: number;
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
  const value = React.useMemo<ContextType>(() => {
    return {
      match,
      matchSummoner,
      index,
      count,
    };
  }, [match, matchSummoner, index, count]);

  return <context.Provider value={value}>{children}</context.Provider>;
};
