import { WinrateBadge } from "@/client/components/summoner/WinrateBadge";
import { DDragonService } from "@puuid/core/shared/services/DDragonService";
import { useLoaderData } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import type { StatsByChampionId } from "@puuid/core/server/db/schema/summoner-statistic";
import React from "react";

const RECENT_SAMPLE_SIZE = 10;

const clamp = (value: number) => Math.min(Math.max(value, 0), 100);
const formatAverage = (value: number) => (Number.isFinite(value) ? value.toFixed(1) : "0.0");
const formatKda = (kills: number, deaths: number, assists: number) => {
  const denominator = Math.max(1, deaths);
  return ((kills + assists) / denominator).toFixed(1);
};

export const MatchesSummary = () => {
  const { queueStats } = useLoaderData({ from: "/lol/summoner/$riotID" });
  const metadata = useLoaderData({ from: "__root__" });

  const stats = queueStats?.recentSummonerStatistic;

  if (!stats) return null;

  const totalMatches = stats.wins + stats.losses;
  if (!totalMatches) return null;

  const winrate = clamp((stats.wins / totalMatches) * 100);
  const winrateDegrees = (winrate / 100) * 360;
  const averageKda = Number.isFinite(stats.averageKda)
    ? stats.averageKda.toFixed(1)
    : formatKda(stats.kills, stats.deaths, stats.assists);

  const topChampions: StatsByChampionId = stats.statsByChampionId.slice(0, 3);

  const gaugeStyle: React.CSSProperties = {
    background: `conic-gradient(from 180deg, var(--color-main) ${winrateDegrees}deg, rgba(148, 163, 184, 0.25) ${winrateDegrees}deg 360deg)`,
    boxShadow: "0 16px 30px rgba(15, 23, 42, 0.35)",
  };

  const summaryTitle = `Last ${Math.min(totalMatches, RECENT_SAMPLE_SIZE)} games`;

  return (
    <div className="rounded-2xl border border-white/5 bg-black/35 px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.45)] backdrop-blur">
      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-main/40 bg-main/10 text-main">
            <TrendingUp className="h-3.5 w-3.5" />
          </span>
          <div className="leading-tight">
            <span className="text-sm font-semibold text-white">{summaryTitle}</span>
          </div>
        </div>
        <WinrateBadge value={winrate} showLabel label="WR" className="text-sm" />
      </div>

      <div className="grid gap-5 pt-4 md:grid-cols-[minmax(0,180px)_minmax(0,1fr)_minmax(120px,auto)] md:items-center">
        <div className="flex items-center justify-center gap-3">
          <div className="relative aspect-square w-24 shrink-0">
            <div
              className="absolute inset-0 rounded-full border border-white/10"
              style={gaugeStyle}
            />
            <div className="absolute inset-2 rounded-full bg-background/85 shadow-inner shadow-black/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
              <span className="text-2xl font-semibold text-white">{winrate.toFixed(0)}%</span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Winrate
              </span>
            </div>
          </div>
          <div className="text-left text-xs text-muted-foreground">
            {stats.wins}W - {stats.losses}L
          </div>
        </div>

        <div className="flex flex-row gap-2.5 items-center justify-center">
          {topChampions.length ? (
            topChampions.map((champion) => {
              const matches = champion.wins + champion.losses;
              if (!matches) return null;

              const championData = metadata.champions[champion.championId];
              const championName = championData?.name ?? `Champion ${champion.championId}`;
              const iconUrl = championData
                ? DDragonService.getChampionIconUrlFromParticipant(
                    metadata.champions,
                    metadata.latest_version,
                    champion,
                  )
                : undefined;
              const championWinrate = clamp((champion.wins / matches) * 100);
              const championKda = formatKda(champion.kills, champion.deaths, champion.assists);

              return (
                <div
                  key={`recent-champion-${champion.championId}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 px-2.5 py-1.5"
                >
                  <div className="flex items-center gap-2.5">
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt={`${championName} icon`}
                        className="h-9 w-9 rounded-full border border-main/30 shadow-lg shadow-main/20"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full border border-white/10 bg-muted/30" />
                    )}
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs font-medium text-white">{championName}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {champion.wins}W - {champion.losses}L · {matches} games
                      </span>
                    </div>
                  </div>
                  <div className="text-right leading-tight">
                    <WinrateBadge value={championWinrate} className="text-[11px]" />
                    <div className="text-[11px] text-main/80">KDA {championKda}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-background/40 p-4 text-center text-xs text-muted-foreground">
              No standout champions in the last matches yet.
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2.5 text-right text-xs">
          <div className="leading-tight">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Average KDA
            </span>
            <div className="text-3xl font-semibold text-main drop-shadow-[0_10px_20px_rgba(36,99,255,0.35)]">
              {averageKda}
            </div>
          </div>
          <div className="flex flex-col gap-1 text-muted-foreground">
            <span>
              <span className="text-white">{formatAverage(stats.averageKillPerGame)}</span> /
              <span className="text-red-300"> {formatAverage(stats.averageDeathPerGame)}</span> /{" "}
              <span className="text-main">{formatAverage(stats.averageAssistPerGame)}</span>
            </span>
            <span>per game (K / D / A)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
