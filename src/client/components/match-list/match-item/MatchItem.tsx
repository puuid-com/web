import { MatchListItem } from "@/client/components/match-list/match-item/MatchListItem";
import { useMatchContext } from "@/client/context/MatchContext";
import { useGetMatchDetails } from "@/client/queries/getMatchDetails";
import { Loader2 } from "lucide-react";
import React from "react";
import { MatchDetailsBuilds } from "@/client/components/match-list/match-item/details/builds/MatchDetailsBuilds";
import { MatchParticipantsSelector } from "@/client/components/match-list/match-item/details/MatchParticipantsSelector";
import { MatchDetailsSkills } from "@/client/components/match-list/match-item/details/skills/MatchDetailsSkills";

type Props = {};

export const MatchItem = ({}: Props) => {
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

  const [expanded, setExpanded] = React.useState(false);
  const q_details = useGetMatchDetails({ matchId: match.matchId }, { enabled: expanded });

  function onRowClick(e: React.MouseEvent<HTMLDivElement>) {
    // Don't toggle when clicking interactive elements
    const target = e.target as HTMLElement;
    if (target.closest("a, button, [role=button], input, textarea, select")) return;
    setExpanded((v) => !v);
  }

  const [selected, setSelected] = React.useState<string | null>(matchSummoner.puuid);

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
      <div onClick={onRowClick} className="cursor-pointer">
        <MatchListItem />
      </div>
      {expanded ? (
        <div className="px-3 py-2 border-t border-dashed bg-background/60">
          {q_details.status === "pending" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading match details…
            </div>
          ) : q_details.status === "error" ? (
            <div className="text-sm text-destructive">{q_details.error.message}</div>
          ) : (
            <>
              <div className={"flex flex-col gap-2.5 p-3 rounded"}>
                <div className="flex flex-col md:flex-row gap-3 w-full">
                  <MatchParticipantsSelector
                    match={match}
                    timeline={q_details.data}
                    selectedPuuid={selected}
                    onSelect={setSelected}
                  />
                </div>
                <div className="relative border rounded-md p-3">
                  <span className="absolute -top-2 right-3 px-1 text-xs text-muted-foreground bg-background">
                    Builds
                  </span>
                  <MatchDetailsBuilds
                    match={match}
                    timeline={q_details.data}
                    selectedPuuid={selected}
                  />
                </div>
                <div className="relative border rounded-md p-3">
                  <span className="absolute -top-2 right-3 px-1 text-xs text-muted-foreground bg-background">
                    Skills
                  </span>
                  <MatchDetailsSkills
                    match={match}
                    timeline={q_details.data}
                    selectedPuuid={selected}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};
