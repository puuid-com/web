import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
//

import { ChartsMatchesVirtualTable } from "@/client/components/charts/ChartsMatchesVirtualTable";
import { CumulativeWinrateChart } from "@/client/components/charts/CumulativeWinrateChart";
import { HourlyWinrateChart } from "@/client/components/charts/HourlyWinrateChart";
import { friendlyQueueTypeToRiot } from "@/client/lib/typeHelper";
import { $getSummonerMatches } from "@/server/functions/$getSummonerMatches";
import { ToggleGroup, ToggleGroupItem } from "@/client/components/ui/toggle-group";

export type MatchPoint = {
  datetime: string | Date;
  win: boolean;
};

// (moved) HourBin type lives inside HourlyWinrateChart

type MatchRow = {
  id: string;
  datetime: string | Date;
  duration: number; // seconds
  championId: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  isGroupMatch: boolean;
};

// (moved) buildBins lives inside HourlyWinrateChart

// (moved) DailyCumulative type lives inside CumulativeWinrateChart

// (moved) pad2 lives inside CumulativeWinrateChart

// (moved) dateKey lives inside CumulativeWinrateChart

// (moved) buildDailyCumulative lives inside CumulativeWinrateChart

export const Route = createFileRoute("/lol/summoner/$riotID/charts")({
  component: RouteComponent,
  loaderDeps: (ctx) => {
    return {
      search: {
        q: ctx.search.q,
      },
    };
  },
  loader: async (context) => {
    const summoner = context.context.summoner;
    const queue = friendlyQueueTypeToRiot(context.deps.search.q);
    const queueStats = context.context.summoner.statistics.find((s) => s.queueType === queue);
    const frenquentTeammatesPuuids = queueStats?.statsByTeammates.map((t) => t.puuid) ?? [];

    const matches = await $getSummonerMatches({
      data: {
        puuid: summoner.puuid,
        region: summoner.region,
        queue: queue,
      },
    });

    return {
      data: matches.matches.map<MatchPoint>((m) => {
        return {
          datetime: new Date(m.gameCreationMs),
          win: m.summoners.find((s) => s.puuid === summoner.puuid)!.win,
        };
      }),
      matches: matches.matches.map<MatchRow>((m) => {
        const matchSummoner = m.summoners.find((s) => s.puuid === summoner.puuid)!;
        const teammates = m.summoners.filter(
          (s) => s.teamId === matchSummoner.teamId && s.puuid !== matchSummoner.puuid,
        );

        return {
          id: m.matchId,
          datetime: new Date(m.gameCreationMs),
          duration: m.gameDurationSec,
          championId: matchSummoner.championId,
          win: matchSummoner.win,
          kills: matchSummoner.kills,
          deaths: matchSummoner.deaths,
          assists: matchSummoner.assists,
          isGroupMatch: teammates.some((t) => frenquentTeammatesPuuids.includes(t.puuid)),
        };
      }),
    };
  },
});

type GroupFilterType = "all" | "group" | "solo";

function RouteComponent() {
  const { matches } = Route.useLoaderData();

  // Aggregations handled inside chart components

  const [groupFilter, setGroupFilter] = React.useState<GroupFilterType>("all");

  const filteredMatches = React.useMemo(() => {
    if (groupFilter === "group") return matches.filter((m) => m.isGroupMatch);
    if (groupFilter === "solo") return matches.filter((m) => !m.isGroupMatch);
    return matches;
  }, [matches, groupFilter]);

  const filteredData = React.useMemo(
    () => filteredMatches.map((m) => ({ datetime: m.datetime, win: m.win })),
    [filteredMatches],
  );

  return (
    <div className="w-full mx-auto">
      <div className="grid grid-cols-12 gap-5 relative h-[var(--summoner-outlet-height)]">
        {/* Sticky, virtualized table */}
        <div className="col-span-5 h-[var(--summoner-outlet-height)]">
          <ChartsMatchesVirtualTable data={matches} height="var(--summoner-outlet-height)" />
        </div>

        {/* Chart */}
        <div className="col-span-7 flex flex-col gap-5 overflow-y-auto pr-2">
          <div className="flex items-center justify-end gap-2 sticky top-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 z-10">
            <span className="text-xs text-muted-foreground mr-2">Show:</span>
            <ToggleGroup
              type="single"
              value={groupFilter}
              onValueChange={(v: GroupFilterType) => {
                setGroupFilter(v);
              }}
              variant="main"
            >
              <ToggleGroupItem value="all">All</ToggleGroupItem>
              <ToggleGroupItem value="group">Group</ToggleGroupItem>
              <ToggleGroupItem value="solo">Solo</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <CumulativeWinrateChart data={filteredData} />
          <HourlyWinrateChart data={filteredData} />
        </div>
      </div>
    </div>
  );
}

export default RouteComponent;
