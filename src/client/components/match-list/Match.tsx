import { MatchListItem } from "@/client/components/match-list/MatchListItem";
import { useMatchContext } from "@/client/context/MatchContext";

type Props = {};

export const Match = ({}: Props) => {
  const { matchSummoner, match } = useMatchContext();
  const win = matchSummoner.win;

  const weirdGame = match.resultType !== "NORMAL";

  const backgroundColor = weirdGame
    ? "--color-neutral-800"
    : win
      ? "--color-emerald-800"
      : "--color-red-800";
  const foregroundColor = weirdGame
    ? "--color-neutral-300"
    : win
      ? "--color-emerald-200"
      : "--color-red-200";

  return (
    <div
      style={
        {
          "--color-match": `var(${backgroundColor})`,
          "--color-match-foreground": `var(${foregroundColor})`,
        } as React.CSSProperties
      }
      data-match-id={matchSummoner.matchId}
    >
      <MatchListItem />
      {/* <MatchCommentsSection /> */}
    </div>
  );
};
