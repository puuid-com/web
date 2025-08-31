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
import type { MasteryWithStatistic } from "@/client/lib/masteries";
import { DiamondPercent, Flame, RatIcon } from "lucide-react";

type Props = {
  data: MasteryWithStatistic[];
  height?: number;
  rowEstimate?: number;
};

function fmtNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}

export function ChampionMasteryVirtualTable({ data, height = 520, rowEstimate = 44 }: Props) {
  const metadata = useLoaderData({ from: "/lol" });

  const columnHelper = createColumnHelper<MasteryWithStatistic>();

  const columns = React.useMemo<ColumnDef<MasteryWithStatistic>[]>(
    () => [
      columnHelper.group({
        id: "championGroup",
        header: () => {
          return (
            <div
              className={
                "w-full text-center flex gap-1.5 items-center justify-center border rounded-md"
              }
            >
              <RatIcon className={"w-4"} />
              <span>Champion</span>
            </div>
          );
        },
        columns: [
          columnHelper.accessor((row) => metadata.champions[row.championId]!.name, {
            id: "championName",
            header: "Name",
            enableSorting: true,
            size: 120,
            cell: (ctx) => {
              const champion = metadata.champions[ctx.row.original.championId]!;
              return (
                <div className={"flex gap-2 items-center"}>
                  <img
                    src={DDragonService.getChampionIconUrl(
                      metadata.latest_version,
                      champion.image.full,
                    )}
                    alt={champion.name}
                    className={"w-8 aspect-square"}
                  />
                  <span>{champion.name}</span>
                </div>
              );
            },
          }),
          columnHelper.accessor((row) => row.mastery.championPoints, {
            id: "championPoints",
            header: "Points",
            size: 140,
            cell: (ctx) => fmtNumber(ctx.getValue<number>()),
          }),
          columnHelper.accessor((row) => row.mastery.championLevel, {
            id: "championLevel",
            header: "Level",
            size: 90,
            cell: (ctx) => ctx.getValue<number>(),
          }),
        ],
      }),
      columnHelper.group({
        id: "kda",
        header: () => (
          <div
            className={
              "w-full text-center flex gap-1.5 items-center justify-center border rounded-md"
            }
          >
            <Flame className={"w-4"} />
            <span>KDA</span>
          </div>
        ),
        columns: [
          columnHelper.accessor((row) => row.statistic?.kills, {
            id: "averageKillPerGame",
            header: "Kills",
            cell: (row) => row.getValue<number>(),
          }),
          columnHelper.accessor((row) => row.statistic?.deaths, {
            id: "averageDeathPerGame",
            header: "Deaths",
            cell: (row) => row.getValue<number>(),
          }),
          columnHelper.accessor((row) => row.statistic?.assists, {
            id: "averageAssistPerGame",
            header: "Assists",
            cell: (row) => row.getValue<number>(),
          }),
        ],
      }),
      columnHelper.group({
        id: "winrate",
        header: () => (
          <div
            className={
              "w-full text-center flex gap-1.5 items-center justify-center border rounded-md"
            }
          >
            <DiamondPercent className={"w-4"} />
            <span>Win Rate</span>
          </div>
        ),
        columns: [
          columnHelper.accessor((row) => row.statistic?.wins, {
            id: "wins",
            header: "Wins",
            cell: (ctx) => ctx.getValue<number>(),
          }),
          columnHelper.accessor((row) => row.statistic?.losses, {
            id: "loses",
            header: "Loses",
            cell: (ctx) => ctx.getValue<number>(),
          }),
          columnHelper.accessor((row) => row.statistic?.matches, {
            id: "matches",
            header: "Matches",
            cell: (ctx) => ctx.getValue<number>(),
          }),
          columnHelper.accessor((row) => row.statistic?.winrate, {
            id: "winrate",
            header: "Winrate",
            cell: (ctx) => {
              const _data = ctx.getValue<number | undefined>();

              if (_data === undefined) return null;

              return `${_data}%`;
            },
          }),
        ],
      }),
    ],
    [columnHelper, metadata.champions, metadata.latest_version],
  );

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "championPoints", desc: true },
  ]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => `ChampionMasteryVirtualTable-${row.championId}-`,
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
      <div ref={parentRef} className="w-full overflow-auto rounded-xl border" style={{ height }}>
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b">
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
