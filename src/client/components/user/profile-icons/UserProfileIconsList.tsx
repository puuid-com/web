import { DialogContent } from "@/client/components/ui/dialog";
import { useVirtualizer } from "@tanstack/react-virtual";
import React from "react";

type Props = {
  icons: { id: number; image: string }[];
  version: string;
  onChange: (url: string) => void;
};

export const UserProfileIconsList = ({ icons, onChange, version }: Props) => {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  // Grid config
  const COLS = 5;
  const ROW_HEIGHT = 56; // 48px tile + ~8px gap

  const rowCount = React.useMemo(
    () => (icons.length ? Math.ceil(icons.length / COLS) : 0),
    [icons.length],
  );

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
    getItemKey: (i) => i,
  });

  // Ensure the virtualizer measures after the dialog mounts in the portal
  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      rowVirtualizer.measure();
    });
    return () => {
      cancelAnimationFrame(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-measure if the scroll container resizes
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      rowVirtualizer.measure();
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [rowVirtualizer]);

  return (
    <DialogContent className="max-w-3xl">
      <div ref={scrollRef} className="max-h-[70vh] overflow-auto">
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const startIndex = virtualRow.index * COLS;
            const endIndex = startIndex + COLS;
            const rowIcons = icons.slice(startIndex, endIndex);

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                  height: ROW_HEIGHT,
                }}
              >
                <div className="grid grid-cols-5 gap-2 px-1 py-1">
                  {rowIcons.map((icon) => {
                    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${icon.id}.png`;
                    return (
                      <img
                        key={icon.id}
                        src={url}
                        loading="lazy"
                        decoding="async"
                        alt=""
                        className="w-12 h-12 rounded-md hover:ring-2 hover:ring-primary transition"
                        onClick={() => {
                          onChange(url);
                        }}
                      />
                    );
                  })}
                  {rowIcons.length < COLS &&
                    Array.from({ length: COLS - rowIcons.length }).map((_, i) => (
                      <div key={`pad-${i}`} className="w-12 h-12" />
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DialogContent>
  );
};
