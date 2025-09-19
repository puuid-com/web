import React from "react";
import { useLoaderData } from "@tanstack/react-router";
import { useGetSummonerMatches } from "@/client/queries/getSummonerMatches";
import type { FriendlyQueueType } from "@/client/lib/typeHelper";
import { CDragonService } from "@puuid/core/shared/services/CDragonService";
import { DDragonService } from "@puuid/core/shared/services/DDragonService";
import { ItemTooltip } from "@/client/components/tooltips/ItemTooltip";
import { cn } from "@/client/lib/utils";

type Props = {
  queue?: FriendlyQueueType; // e.g. 'solo' | 'flex' | 'aram' depending on your mapping
  className?: string;
};

export const SummonerChampionItemBuilds: React.FC<Props> = ({ queue = "solo", className }) => {
  const { summoner } = useLoaderData({ from: "/lol/summoner/$riotID" });
  const { latest_version, champions } = useLoaderData({ from: "__root__" });

  const q_matches = useGetSummonerMatches({ queue, summoner });

  const { championIds, buildsByChampion } = React.useMemo(() => {
    const ids: number[] = [];
    const byChamp = new Map<number, { items: number[]; matchId: string; win: boolean }[]>();

    if (q_matches.status === "success") {
      for (const m of q_matches.data.matches) {
        const p = m.summoners.find((s) => s.puuid === summoner.puuid);
        if (!p) continue;
        if (!byChamp.has(p.championId)) byChamp.set(p.championId, []);
        byChamp.get(p.championId)!.push({ items: p.items, matchId: m.matchId, win: p.win });
      }
      for (const k of byChamp.keys()) ids.push(k);
      // sort by most games first
      ids.sort((a, b) => (byChamp.get(b)?.length ?? 0) - (byChamp.get(a)?.length ?? 0));
    }

    return { championIds: ids, buildsByChampion: byChamp };
  }, [q_matches.data, q_matches.status, summoner.puuid]);

  const [selected, setSelected] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (selected == null && championIds.length) setSelected(championIds[0]!);
  }, [championIds, selected]);

  const builds = selected != null ? (buildsByChampion.get(selected) ?? []) : [];

  return (
    <div className={cn("flex gap-4 bg-red-950", className)}>
      {/* champions list */}
      <div className="w-48 shrink-0 border rounded-md p-2 bg-background/50">
        <div className="text-sm font-medium mb-2 opacity-80">Champions</div>
        <div className="grid grid-cols-4 gap-2">
          {q_matches.status === "pending" ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="w-10 aspect-square rounded-md bg-foreground/10 animate-pulse"
              />
            ))
          ) : q_matches.status === "error" ? (
            <div className="col-span-4 text-destructive text-sm">{q_matches.error.message}</div>
          ) : championIds.length ? (
            championIds.map((cid) => {
              const name = champions[cid]?.name ?? String(cid);
              const url = CDragonService.getChampionSquare(cid);
              const isActive = cid === selected;
              return (
                <button
                  key={cid}
                  type="button"
                  onClick={() => {
                    setSelected(cid);
                  }}
                  className={cn(
                    "w-10 aspect-square rounded-md overflow-hidden ring-1 ring-border/60",
                    isActive ? "outline-2 outline-main/70" : "hover:ring-border",
                  )}
                  title={name}
                >
                  <img
                    src={url}
                    alt={name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              );
            })
          ) : (
            <div className="col-span-4 text-sm text-muted-foreground">No matches</div>
          )}
        </div>
      </div>

      {/* builds list */}
      <div className="flex-1 border rounded-md p-3 bg-background/50 min-h-24">
        {selected != null ? (
          <div className="flex items-center gap-2 mb-3">
            <img
              src={CDragonService.getChampionSquare(selected)}
              alt={champions[selected]?.name ?? String(selected)}
              className="w-6 h-6 rounded"
            />
            <div className="font-medium">{champions[selected]?.name ?? selected}</div>
            <div className="text-xs text-muted-foreground">{`${builds.length} match${builds.length === 1 ? "" : "es"}`}</div>
          </div>
        ) : null}

        {q_matches.status === "pending" ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 rounded bg-foreground/10 animate-pulse" />
            ))}
          </div>
        ) : q_matches.status === "error" ? (
          <div className="text-destructive text-sm">{q_matches.error.message}</div>
        ) : builds.length ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {builds.map((b, idx) => (
              <div
                key={`${b.matchId}:${idx}`}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1 ring-1 ring-border/50",
                  b.win ? "bg-emerald-800/10" : "bg-red-800/10",
                )}
                title={b.matchId}
              >
                {b.items.map((itemId, i) => (
                  <ItemTooltip key={i} itemId={itemId}>
                    <img
                      src={DDragonService.getItemIconUrl(latest_version, itemId)}
                      alt=""
                      className="w-6 aspect-square rounded"
                      loading="lazy"
                      decoding="async"
                    />
                  </ItemTooltip>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No builds for this champion.</div>
        )}
      </div>
    </div>
  );
};
