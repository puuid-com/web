import { MatchListItem } from "@/client/components/match-list/MatchListItem";
import { cn } from "@/client/lib/utils";
import type { GetSummonerMatchesType } from "@/client/queries/getSummonerMatches";
import type { SummonerType } from "@/server/db/schema";
import type { $GetSummonerMatchesType } from "@/server/functions/$getSummonerMatches";
import { useVirtualizer } from "@tanstack/react-virtual";
import React from "react";

type Props = {
  matches: GetSummonerMatchesType["matches"];
  summoner: SummonerType;
};

export const MatchListContent = ({ matches, summoner }: Props) => {
  const parentRef = React.useRef<HTMLDivElement | null>(null);

  const height = 60;

  const rowVirtualizer = useVirtualizer({
    count: matches.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => height,
    overscan: 8,
    measureElement: (el) => el?.getBoundingClientRect().height,
  });

  return (
    <div
      ref={parentRef}
      className={cn(
        "overflow-auto rounded-2xl border border-dashed",
        "bg-background"
      )}
      style={{
        height: `${height * 5}px`,
      }}
    >
      <div
        className="relative w-full"
        style={{ height: rowVirtualizer.getTotalSize() }}
      >
        {rowVirtualizer.getVirtualItems().map((vRow) => {
          const m = matches[vRow.index]!;
          const p = m.summoners.find((s) => s.puuid === summoner.puuid)!;

          return (
            <div
              data-index={vRow.index}
              key={m.matchId}
              ref={rowVirtualizer.measureElement}
              className="absolute left-0 top-0 w-full"
              style={{ transform: `translateY(${vRow.start}px)` }}
            >
              <div className="border-b border-dashed">
                <MatchListItem
                  m={m}
                  p={p}
                  i={vRow.index}
                  count={matches.length}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
