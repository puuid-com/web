import React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { SummonerListItem } from "@/client/components/summoner-list/SummonerListItem";
import type { $GetSummonersType } from "@/server/functions/$getSummoners";

type Props = { summoners: $GetSummonersType };

type Row =
  | { type: "header"; key: string; region: string; count: number }
  | { type: "item"; key: string; s: $GetSummonersType[number] };

export const SummonerList = ({ summoners }: Props) => {
  const parentRef = React.useRef<HTMLDivElement | null>(null);

  const ITEM_ESTIMATE = 80;
  const HEADER_ESTIMATE = 36;

  const rows = React.useMemo<Row[]>(() => {
    const counts = new Map<string, number>();
    for (const s of summoners) {
      counts.set(s.region, (counts.get(s.region) ?? 0) + 1);
    }

    const out: Row[] = [];
    let lastRegion: string | null = null;

    for (const s of summoners) {
      if (s.region !== lastRegion) {
        out.push({
          type: "header",
          key: `region-${s.region}`,
          region: s.region,
          count: counts.get(s.region) ?? 0,
        });
        lastRegion = s.region;
      }
      out.push({
        type: "item",
        key: `summoner-${s.puuid}`,
        s,
      });
    }
    return out;
  }, [summoners]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => (rows[i]!.type === "header" ? HEADER_ESTIMATE : ITEM_ESTIMATE),
    overscan: 10,
  });

  const items = virtualizer.getVirtualItems();

  if (rows.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        No summoners yet
      </div>
    );
  }

  // padding haut et bas pour caler le bloc visible dans la grande hauteur virtuelle
  const padTop = items[0]?.start ?? 0;
  const padBot = items.length > 0 ? virtualizer.getTotalSize() - items[items.length - 1]!.end : 0;

  return (
    <div ref={parentRef} className="h-full w-full overflow-auto">
      <div className="mx-auto max-w-7xl px-10 py-4">
        <div className="w-full flex flex-col" style={{ paddingTop: padTop, paddingBottom: padBot }}>
          {items.map((vi) => {
            const row = rows[vi.index]!;

            if (row.type === "header") {
              return (
                <div
                  key={row.key}
                  className="h-9 w-full px-3 flex items-center bg-muted/40 text-xs font-semibold uppercase tracking-wide rounded-md mb-2"
                  style={{ height: vi.size }}
                >
                  <span className="mr-2">{row.region}</span>
                  <span className="opacity-60">{row.count}</span>
                </div>
              );
            }

            return (
              <div key={row.key} className="w-full mb-2" style={{ height: vi.size }}>
                <SummonerListItem s={row.s} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
