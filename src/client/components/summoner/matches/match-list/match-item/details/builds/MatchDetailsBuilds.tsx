import React from "react";
import { useLoaderData } from "@tanstack/react-router";
import type { $getMatchDetailsType } from "@/server/functions/$getMatchDetails";
import type { GetSummonerMatchesType } from "@/client/queries/getSummonerMatches";
import { DDragonService } from "@puuid/core/shared/services/DDragonService";
import { ItemTooltip } from "@/client/components/tooltips/ItemTooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/client/components/ui/tooltip";
import { MinusCircle, ChevronRight, Info } from "lucide-react";
import { Button } from "@/client/components/ui/button";
import { cn, formatSeconds } from "@/client/lib/utils";
// participants selector moved to its own component

type Match = GetSummonerMatchesType["data"][number];

type Props = {
  match: Match;
  timeline: NonNullable<$getMatchDetailsType>;
  selectedPuuid?: string | null;
};

export const MatchDetailsBuilds: React.FC<Props> = ({ match, timeline, selectedPuuid }) => {
  const { latest_version } = useLoaderData({ from: "__root__" });

  const mapping =
    timeline.info.participants?.reduce((acc: Map<string, number>, p) => {
      acc.set(p.puuid, p.participantId);
      return acc;
    }, new Map<string, number>()) ?? null;

  const participants = match.summoners.map((s) => ({
    puuid: s.puuid,
    championId: s.championId,
    participantId: mapping?.get(s.puuid) ?? null,
  }));

  const selected =
    participants.find((p) => p.puuid === (selectedPuuid ?? participants[0]?.puuid ?? null)) ??
    participants[0] ??
    null;

  // Raw events for the selected participant (keep undo details)
  type RawEvent =
    | { type: "ITEM_PURCHASED"; ts: number; itemId: number }
    | { type: "ITEM_SOLD"; ts: number; itemId: number }
    | { type: "ITEM_DESTROYED"; ts: number; itemId: number }
    | { type: "ITEM_UNDO"; ts: number; beforeId: number; afterId: number };

  const rawEvents = React.useMemo<RawEvent[]>(() => {
    if (!selected?.participantId) return [] as RawEvent[];
    const list: RawEvent[] = [];
    for (const f of timeline.info.frames) {
      for (const e of f.events) {
        if (e.type === "ITEM_UNDO") {
          const ev = e as unknown as {
            type: "ITEM_UNDO";
            timestamp: number;
            participantId: number;
            beforeId: number;
            afterId: number;
          };
          if (ev.participantId === selected.participantId) {
            list.push({
              ts: ev.timestamp,
              type: ev.type,
              beforeId: ev.beforeId,
              afterId: ev.afterId,
            });
          }
        } else if (e.type === "ITEM_PURCHASED" || e.type === "ITEM_SOLD") {
          const ev = e as unknown as {
            type: "ITEM_PURCHASED" | "ITEM_SOLD";
            timestamp: number;
            participantId?: number;
            itemId: number;
          };
          const pid = ev.participantId;
          if (pid === selected.participantId) {
            list.push({ ts: ev.timestamp, type: ev.type, itemId: ev.itemId });
          }
        } else if (e.type === "ITEM_DESTROYED") {
          const ev = e as unknown as {
            type: "ITEM_DESTROYED";
            timestamp: number;
            participantId?: number;
            itemId: number;
          };
          const pid = ev.participantId;
          if (pid === selected.participantId) {
            list.push({ ts: ev.timestamp, type: ev.type, itemId: ev.itemId });
          }
        }
      }
    }
    list.sort((a, b) => a.ts - b.ts);
    return list;
  }, [selected?.participantId, timeline.info.frames]);

  // Simplified events for display (no undo details)
  const events = React.useMemo(() => {
    const out: {
      ts: number;
      type: "ITEM_PURCHASED" | "ITEM_SOLD" | "ITEM_UNDO";
      itemId: number;
    }[] = [];
    for (const ev of rawEvents) {
      if (ev.type === "ITEM_DESTROYED") continue; // hidden in display, only affects inventory state
      if (ev.type === "ITEM_UNDO") {
        out.push({ ts: ev.ts, type: ev.type, itemId: ev.afterId || ev.beforeId });
      } else {
        out.push({ ts: ev.ts, type: ev.type, itemId: ev.itemId });
      }
    }
    return out;
  }, [rawEvents]);

  // Group events by minute bucket
  const buckets = React.useMemo(() => {
    const byMinute = new Map<number, { ts: number; type: string; itemId: number }[]>();
    for (const ev of events) {
      const m = Math.floor(ev.ts / 60000);
      const arr = byMinute.get(m) ?? [];
      arr.push(ev);
      byMinute.set(m, arr);
    }
    const minutes = Array.from(byMinute.keys()).sort((a, b) => a - b);
    return minutes.map((m) => ({
      minute: m,
      events: byMinute.get(m)!.sort((a, b) => a.ts - b.ts),
    }));
  }, [events]);

  // Build inventory snapshot at the end of each minute bucket
  const buildsPerMinute = React.useMemo(() => {
    const minutes = buckets.map((b) => b.minute).sort((a, b) => a - b);
    const inv = new Map<number, number>(); // itemId -> count
    const out = new Map<number, number[]>(); // minute -> items
    let idx = 0;
    for (const m of minutes) {
      const cutoff = (m + 1) * 60000 - 1;
      while (idx < rawEvents.length) {
        const evAny = rawEvents[idx]!;
        const ts = evAny.ts;
        if (ts > cutoff) break;
        if (evAny.type === "ITEM_PURCHASED") {
          const ev = evAny as { type: "ITEM_PURCHASED"; ts: number; itemId: number };
          inv.set(ev.itemId, (inv.get(ev.itemId) ?? 0) + 1);
        } else if (evAny.type === "ITEM_SOLD") {
          const ev = evAny as { type: "ITEM_SOLD"; ts: number; itemId: number };
          const c = inv.get(ev.itemId) ?? 0;
          if (c > 0) inv.set(ev.itemId, c - 1);
        } else if (evAny.type === "ITEM_DESTROYED") {
          const ev = evAny as { type: "ITEM_DESTROYED"; ts: number; itemId: number };
          const c = inv.get(ev.itemId) ?? 0;
          if (c > 0) inv.set(ev.itemId, c - 1);
        } else {
          const ev = evAny as { type: "ITEM_UNDO"; ts: number; beforeId: number; afterId: number };
          if (ev.beforeId && ev.beforeId > 0) {
            const c = inv.get(ev.beforeId) ?? 0;
            if (c > 0) inv.set(ev.beforeId, c - 1);
          }
          if (ev.afterId && ev.afterId > 0) {
            inv.set(ev.afterId, (inv.get(ev.afterId) ?? 0) + 1);
          }
        }
        idx++;
      }
      const arr: number[] = [];
      for (const [id, c] of inv) {
        for (let k = 0; k < c; k++) arr.push(id);
      }
      out.set(m, arr.slice(0, 6));
    }
    return out;
  }, [buckets, rawEvents]);

  return (
    <div className="flex flex-col gap-3">
      {/* Participants selector moved; only rendering timeline below */}

      {/* Timeline list (horizontal, grouped by minute with build tooltips) */}
      {!selected?.participantId ? (
        <div className="text-sm text-muted-foreground">
          Timeline participant mapping not available for this match.
        </div>
      ) : buckets.length === 0 ? (
        <div className="text-sm text-muted-foreground">No item events found.</div>
      ) : (
        <div className="flex flex-wrap items-start gap-3">
          {buckets.map((b, idx) => (
            <React.Fragment key={`bucket-${b.minute}`}>
              <div className="flex flex-col items-center gap-1">
                {/* Items for this minute */}
                <div className="flex items-center gap-1">
                  {b.events.map((ev, i) => {
                    const ringCls =
                      ev.type === "ITEM_SOLD"
                        ? "ring-red-400/50"
                        : ev.type === "ITEM_UNDO"
                          ? "ring-amber-400/50"
                          : "";
                    return (
                      <ItemTooltip key={`${ev.ts}:${i}`} itemId={ev.itemId}>
                        <Button variant="main" size="xs" className="p-0 rounded-md leading-none">
                          <div className="relative">
                            <img
                              src={DDragonService.getItemIconUrl(latest_version, ev.itemId)}
                              alt=""
                              className={cn(
                                "w-7 aspect-square rounded bg-background",
                                ringCls,
                                ev.type === "ITEM_SOLD" && "opacity-60",
                              )}
                            />
                            {ev.type === "ITEM_SOLD" ? (
                              <MinusCircle className="absolute -top-1 -right-1 w-3 h-3 text-red-400 drop-shadow" />
                            ) : null}
                          </div>
                        </Button>
                      </ItemTooltip>
                    );
                  })}
                </div>
                {/* Minute label + info tooltip with current build */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="tabular-nums">{formatSeconds(b.minute * 60)}</div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="main"
                        size="icon"
                        className="hover:cursor-auto"
                        title="Current build at this minute"
                      >
                        <Info className="w-1.5 h-1.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="border border-neutral-800 p-2">
                      <div className="grid grid-cols-3 gap-1">
                        {(buildsPerMinute.get(b.minute) ?? []).length ? (
                          (buildsPerMinute.get(b.minute) ?? []).map((id, i) => (
                            <Button
                              key={`${id}:${i}`}
                              variant="main"
                              size="xs"
                              className="p-0 rounded-[4px] leading-none"
                              title="Item"
                            >
                              <img
                                src={DDragonService.getItemIconUrl(latest_version, id)}
                                alt=""
                                className="w-5 h-5 rounded"
                              />
                            </Button>
                          ))
                        ) : (
                          <div className="col-span-3 text-tiny text-muted-foreground">No items</div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              {idx < buckets.length - 1 ? <ChevronRight className="w-4 h-4 text-main/80" /> : null}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
