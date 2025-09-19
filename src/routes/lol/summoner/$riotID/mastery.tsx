import { ChampionMasteryFilters } from "@/client/components/summoner/masteries/ChampionMasteryFilters";
import { ChampionMasteryVirtualTable } from "@/client/components/summoner/masteries/ChampionMasteryVirtualTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/client/components/ui/avatar";
import { combineMasteryWithStatistic } from "@/client/lib/masteries";
import { friendlyQueueTypeToRiot } from "@/client/lib/typeHelper";
import { getSummonerMasteriesOptions } from "@/client/queries/getSummonerMasteries";
import { getSummonerStatisticsOptions } from "@/client/queries/getSummonerStatistics";
import { CDragonService } from "@puuid/core/shared/services/CDragonService";
import { LolPositions } from "@puuid/core/server/api-route/riot/match/MatchDTO";
import { useQueries } from "@tanstack/react-query";
import { createFileRoute, useLoaderData, useSearch } from "@tanstack/react-router";
import React from "react";
import * as v from "valibot";

export const Route = createFileRoute("/lol/summoner/$riotID/mastery")({
  component: RouteComponent,
  validateSearch: (raw) =>
    v.parse(
      v.object({
        champion: v.exactOptional(v.string()),
        onlyPlayed: v.exactOptional(v.boolean()),
        positions: v.exactOptional(v.array(v.picklist(LolPositions))),
      }),
      raw,
    ),
});

function RouteComponent() {
  const metadata = useLoaderData({ from: "__root__" });
  const { summoner } = useLoaderData({ from: "/lol/summoner/$riotID" });
  const {
    q: queue,
    champion,
    onlyPlayed,
  } = useSearch({
    from: "/lol/summoner/$riotID/mastery",
  });

  const [masteriesQuery, statisticsQuery] = useQueries({
    queries: [
      getSummonerMasteriesOptions({
        summoner,
      }),
      getSummonerStatisticsOptions({
        summoner,
      }),
    ],
  });

  const { data, isPending, isError, _masteriesData } = React.useMemo(() => {
    const isPending = masteriesQuery.status === "pending" || statisticsQuery.status === "pending";
    const isError = masteriesQuery.status === "error" || statisticsQuery.status === "error";

    const _masteriesData = masteriesQuery.data;
    const _statisticData = statisticsQuery.data;

    if (isPending || isError || !_masteriesData) {
      return {
        isPending,
        isError,
        data: null,
        _masteriesData: null,
      };
    }

    const stat = _statisticData?.find((s) => s.queueType === friendlyQueueTypeToRiot(queue));
    const combined = combineMasteryWithStatistic(_masteriesData.masteries, stat).filter((c) => {
      const championName = metadata.champions[c.championId]!.name;

      if (onlyPlayed && !c.statistic) return false;
      if (champion && !championName.toUpperCase().startsWith(champion.toUpperCase())) return false;

      return true;
    });

    return {
      isPending: false,
      isError: false,
      data: combined,
      _masteriesData: _masteriesData.masteries,
    };
  }, [
    champion,
    masteriesQuery.data,
    masteriesQuery.status,
    metadata.champions,
    onlyPlayed,
    queue,
    statisticsQuery.data,
    statisticsQuery.status,
  ]);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (isError || !data) {
    return <div>Error</div>;
  }

  const top3Champions = _masteriesData
    .sort((a, b) => b.championPoints - a.championPoints)
    .slice(0, 3)
    .map((c) => {
      const champion = metadata.champions[c.championId]!;
      return {
        ...c,
        name: champion.name,
        avatar: CDragonService.getChampionSquare(champion.id),
      };
    });

  return (
    <div className={"flex flex-col gap-5 w-full"}>
      <div className="flex items-center justify-center gap-8">
        {/* Second Place - Left (Medium Circle) */}
        {top3Champions[1] && (
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-slate-700 border-2 border-slate-400 flex items-center justify-center overflow-hidden">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={top3Champions[1].avatar || "/placeholder.svg"}
                    alt={top3Champions[1].name}
                  />
                  <AvatarFallback>{top3Champions[1].name[0]}</AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-slate-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                2
              </div>
            </div>
            <div className="mt-3 text-center">
              <div className="text-sm font-medium text-foreground">{top3Champions[1].name}</div>
              <div className="text-xs text-muted-foreground">
                {top3Champions[1].championPoints.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* First Place - Center (Large Circle) */}
        {top3Champions[0] && (
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-slate-700 border-3 border-yellow-500 flex items-center justify-center overflow-hidden">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={top3Champions[0].avatar || "/placeholder.svg"}
                    alt={top3Champions[0].name}
                  />
                  <AvatarFallback>{top3Champions[0].name[0]}</AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-sm font-bold rounded-full w-7 h-7 flex items-center justify-center">
                1
              </div>
            </div>
            <div className="mt-3 text-center">
              <div className="text-base font-semibold text-yellow-400">{top3Champions[0].name}</div>
              <div className="text-sm text-muted-foreground">
                {top3Champions[0].championPoints.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Third Place - Right (Small Circle) */}
        {top3Champions[2] && (
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-slate-700 border-2 border-amber-600 flex items-center justify-center overflow-hidden">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={top3Champions[2].avatar || "/placeholder.svg"}
                    alt={top3Champions[2].name}
                  />
                  <AvatarFallback>{top3Champions[2].name[0]}</AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                3
              </div>
            </div>
            <div className="mt-3 text-center">
              <div className="text-sm font-medium text-foreground">{top3Champions[2].name}</div>
              <div className="text-xs text-muted-foreground">
                {top3Champions[2].championPoints.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
      <ChampionMasteryFilters dataCount={data.length} />

      <ChampionMasteryVirtualTable data={data} />
    </div>
  );
}
