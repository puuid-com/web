import { MatchListItem } from "@/client/components/match-list/MatchListItem";
import { cn } from "@/client/lib/utils";
import type { GetSummonerMatchesType } from "@/client/queries/getSummonerMatches";
import type { SummonerType } from "@/server/db/schema/summoner";
import { useVirtualizer } from "@tanstack/react-virtual";
import React from "react";

type Props = {
  matches: GetSummonerMatchesType["matches"];
  summoner: SummonerType;
};

type GroupStats = {
  totalTimePlayed: number; // seconds
  wins: number;
  loses: number;
};

type Row =
  | { type: "header"; key: string; label: string; groupStats: GroupStats }
  | { type: "item"; key: string; matchIndex: number };

const formatDuration = (totalSec: number) => {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${String(h)} h ${String(m)} min`;
  return `${String(m)} min`;
};

export const MatchListContent = ({ matches }: Props) => {
  const parentRef = React.useRef<HTMLDivElement | null>(null);

  const ITEM_ESTIMATE = 60;
  const HEADER_ESTIMATE = 36;

  const rows = React.useMemo<Row[]>(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // key, label, idxs, and running stats
    const groups = new Map<string, { label: string; idxs: number[]; stats: GroupStats }>();

    for (let i = 0; i < matches.length; i++) {
      const m = matches[i]!.match;
      const p = matches[i]!.match_summoner;

      const d = new Date(m.gameCreationMs);

      // stable day key via toLocaleString
      const key = d.toLocaleString(navigator.language, {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      // human label via toLocaleString
      const label = d.toLocaleString(navigator.language, {
        timeZone: tz,
        dateStyle: "medium",
      });

      if (!groups.has(key)) {
        groups.set(key, {
          label,
          idxs: [],
          stats: { totalTimePlayed: 0, wins: 0, loses: 0 },
        });
      }

      const bucket = groups.get(key)!;
      bucket.idxs.push(i);

      bucket.stats.totalTimePlayed += m.gameDurationSec;

      if (p.win) bucket.stats.wins += 1;
      else bucket.stats.loses += 1;
    }

    const flat: Row[] = [];
    for (const [key, { label, idxs, stats }] of groups) {
      flat.push({ type: "header", key, label, groupStats: stats });
      for (const i of idxs) {
        flat.push({
          type: "item",
          key: matches[i]!.match.matchId,
          matchIndex: i,
        });
      }
    }
    return flat;
  }, [matches]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => document.querySelector("#body-content"),
    estimateSize: (index) => (rows[index]?.type === "header" ? HEADER_ESTIMATE : ITEM_ESTIMATE),
    overscan: 8,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  return (
    <div ref={parentRef} className={cn("w-full rounded-md", "bg-background")}>
      <div className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
        {rowVirtualizer.getVirtualItems().map((vRow) => {
          const row = rows[vRow.index]!;
          return (
            <div
              data-index={vRow.index}
              key={row.key + ":" + String(vRow.index)}
              ref={rowVirtualizer.measureElement}
              className="absolute left-0 top-0 w-full"
              style={{ transform: `translateY(${String(vRow.start)}px)` }}
            >
              {row.type === "header" ? (
                <div className="px-3 py-2 border rounded-t-md bg-main/5 border-dashed justify-between items-center flex">
                  <div className={"flex gap-2.5"}>
                    <div>{row.label}</div>
                    {row.groupStats.loses + row.groupStats.wins > 1 ? (
                      <div>{`(${formatDuration(row.groupStats.totalTimePlayed)})`}</div>
                    ) : null}
                  </div>
                  {row.groupStats.loses + row.groupStats.wins > 1 ? (
                    <div className="flex gap-2.5 justify-between items-center">
                      <div className={"flex flex-col justify-center items-end"}>
                        <div
                          className={"text-xs"}
                        >{`${((row.groupStats.wins / (row.groupStats.loses + row.groupStats.wins)) * 100).toFixed(0)}% WR`}</div>
                        <div
                          className={"text-tiny"}
                        >{`${String(row.groupStats.loses + row.groupStats.wins)} matches`}</div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="border-b border-dashed">
                  {(() => {
                    const { match: m, match_summoner: p } = matches[row.matchIndex]!;
                    return (
                      <MatchListItem
                        m={m}
                        p={p}
                        i={matches.length - row.matchIndex}
                        count={matches.length}
                      />
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
