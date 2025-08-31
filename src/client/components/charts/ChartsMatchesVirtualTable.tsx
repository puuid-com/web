import * as React from "react";
import {
  type ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useLoaderData } from "@tanstack/react-router";
import { DDragonService } from "@/shared/services/DDragon/DDragonService";
import { Clock, Flame, User } from "lucide-react";

export type MatchRow = {
  id: string;
  datetime: string | Date;
  duration: number;
  championId: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
};

type Props = {
  data: MatchRow[];
  height?: number;
  rowEstimate?: number;
};

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}
function formatHM(date: Date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}
function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${pad2(s)}s`;
}
function kda(k: number, d: number, a: number) {
  return d === 0 ? "Perfect" : ((k + a) / Math.max(1, d)).toFixed(2);
}

export function ChartsMatchesVirtualTable({ data, height = 520, rowEstimate = 44 }: Props) {
  const metadata = useLoaderData({ from: "/lol" });

  const columnHelper = createColumnHelper<MatchRow>();

  const columns = React.useMemo<ColumnDef<MatchRow>[]>(
    () => [
      columnHelper.group({
        id: "championGroup",
        header: () => (
          <div className="w-full text-center flex gap-1.5 items-center justify-center border rounded-md">
            <User className="w-4" />
            <span>Champion</span>
          </div>
        ),
        columns: [
          columnHelper.accessor((row) => row.championId, {
            id: "champion",
            header: "Name",
            enableSorting: true,
            meta: { widthPct: 28 }, // %
            cell: (ctx) => {
              const champ = metadata.champions[ctx.row.original.championId]!;
              return (
                <div className="flex gap-2 items-center whitespace-nowrap overflow-hidden text-ellipsis">
                  <img
                    src={DDragonService.getChampionIconUrl(
                      metadata.latest_version,
                      champ.image.full,
                    )}
                    alt={champ.name}
                    className="w-6 aspect-square"
                  />
                  <span className="text-sm">{champ.name}</span>
                </div>
              );
            },
          }),
        ],
      }),

      columnHelper.group({
        id: "matchInfo",
        header: () => (
          <div className="w-full text-center flex gap-1.5 items-center justify-center border rounded-md">
            <Clock className="w-4" />
            <span>Match</span>
          </div>
        ),
        columns: [
          columnHelper.accessor((row) => new Date(row.datetime).getTime(), {
            id: "datetime",
            header: "Time",
            enableSorting: true,
            meta: { widthPct: 16 },
            cell: ({ row }) => {
              const dt = new Date(row.original.datetime);
              return (
                <div className="text-xs text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis">
                  <div className="font-medium">{formatHM(dt)}</div>
                  <div className="text-[10px] text-gray-500">
                    {dt.getFullYear()}-{pad2(dt.getMonth() + 1)}-{pad2(dt.getDate())}
                  </div>
                </div>
              );
            },
          }),
          columnHelper.accessor((row) => (row.win ? 1 : 0), {
            id: "result",
            header: "Result",
            enableSorting: true,
            meta: { widthPct: 10 },
            cell: ({ row }) => (
              <span
                className={
                  row.original.win
                    ? "text-emerald-400 text-xs font-semibold"
                    : "text-red-400 text-xs font-semibold"
                }
              >
                {row.original.win ? "Win" : "Loss"}
              </span>
            ),
          }),
          columnHelper.accessor((row) => row.duration, {
            id: "duration",
            header: "Duration",
            enableSorting: true,
            meta: { widthPct: 12 },
            cell: ({ row }) => (
              <span className="text-xs text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">
                {formatDuration(row.original.duration)}
              </span>
            ),
          }),
        ],
      }),

      columnHelper.group({
        id: "performance",
        header: () => (
          <div className="w-full text-center flex gap-1.5 items-center justify-center border rounded-md">
            <Flame className="w-4" />
            <span>Performance</span>
          </div>
        ),
        columns: [
          columnHelper.accessor(
            (row) => (row.deaths === 0 ? 9999 : (row.kills + row.assists) / row.deaths),
            {
              id: "kda",
              header: "KDA",
              enableSorting: true,
              meta: { widthPct: 10 },
              cell: ({ row }) => {
                const r = row.original;
                return (
                  <div className="text-xs text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis flex flex-col">
                    <span className="font-medium">{kda(r.kills, r.deaths, r.assists)}</span>
                    <span className={"text-muted-foreground"}>
                      ({r.kills}/{r.deaths}/{r.assists})
                    </span>
                  </div>
                );
              },
            },
          ),
        ],
      }),
    ],
    [columnHelper, metadata.champions, metadata.latest_version],
  );

  const [sorting, setSorting] = React.useState<SortingState>([{ id: "datetime", desc: true }]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => `MatchesVirtualTable-${row.id}`,
    columnResizeMode: "onChange",
  });

  const parentRef = React.useRef<HTMLDivElement | null>(null);
  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowEstimate,
    overscan: 8,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0]!.start : 0;
  const paddingBottom =
    virtualItems.length > 0 ? totalSize - virtualItems[virtualItems.length - 1]!.end : 0;

  return (
    <div className="w-full">
      <div
        ref={parentRef}
        className="w-full overflow-auto rounded-xl tabular-nums"
        style={{ height }}
      >
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-background border-none">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="px-3 py-2 text-left font-semibold select-none align-middle"
                      style={{ width: header.getSize() }}
                    >
                      {!header.isPlaceholder && (
                        <div
                          className={
                            "flex items-center gap-1 " +
                            (canSort ? "cursor-pointer" : "cursor-default")
                          }
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortDir === "asc" ? (
                            <span aria-hidden>▲</span>
                          ) : sortDir === "desc" ? (
                            <span aria-hidden>▼</span>
                          ) : null}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {paddingTop > 0 && (
              <tr>
                <td colSpan={table.getAllLeafColumns().length} style={{ height: paddingTop }} />
              </tr>
            )}

            {virtualItems.map((vi) => {
              const row = rows[vi.index]!;
              return (
                <tr key={row.id} className="border-b hover:bg-muted/50" style={{ height: vi.size }}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}

            {paddingBottom > 0 && (
              <tr>
                <td colSpan={table.getAllLeafColumns().length} style={{ height: paddingBottom }} />
              </tr>
            )}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">No rows</div>
        )}
      </div>
    </div>
  );
}
