import { MatchListItem } from "@/client/components/match-list/MatchListItem";
import { useMatchContext } from "@/client/context/MatchContext";

type Props = {};

export const Match = ({}: Props) => {
  const { matchSummoner } = useMatchContext();
  const win = matchSummoner.win;

  const backgroundColor = win ? "--color-emerald-800" : "--color-red-800";
  const foregroundColor = win ? "--color-emerald-200" : "--color-red-200";

  return (
    <div
      style={
        {
          "--color-match": `var(${backgroundColor})`,
          "--color-match-foreground": `var(${foregroundColor})`,
        } as React.CSSProperties
      }
    >
      <MatchListItem />
      {/* <MatchCommentsSection /> */}
    </div>
  );
};
