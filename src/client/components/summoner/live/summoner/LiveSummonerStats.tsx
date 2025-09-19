import type { StatisticRowType } from "@puuid/core/server/db/schema/summoner-statistic";
import { CDragonService } from "@puuid/core/shared/services/CDragonService";
import { DDragonService } from "@puuid/core/shared/services/DDragonService";
import { useLoaderData } from "@tanstack/react-router";

// tone for KDA badge
function kdaTone(kda: number) {
  if (kda >= 5) return "bg-emerald-600/15 text-emerald-400 ring-emerald-500/30";
  if (kda >= 3) return "bg-sky-600/15 text-sky-400 ring-sky-500/30";
  if (kda >= 2) return "bg-amber-600/15 text-amber-400 ring-amber-500/30";
  return "bg-rose-600/15 text-rose-400 ring-rose-500/30";
}

function pct(n: number) {
  return Math.round(n * 100);
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

type StatsPanelProps = {
  stats: StatisticRowType;
};

/**
 * Inline stats designed for tight live rows,
 * adds a small row header chip "Last 20 matches" above the stats,
 * mirrors with team columns using group-last utilities.
 */
export function LiveSummonerStats({ stats }: StatsPanelProps) {
  const metadata = useLoaderData({ from: "__root__" });
  const total = stats.wins + stats.losses;
  const winrate01 = total > 0 ? stats.wins / total : 0;
  const winratePct = pct(winrate01);
  const champName = DDragonService.getChampionName(metadata.champions, stats.mainChampionId);
  const champImg = CDragonService.getChampionSquare(stats.mainChampionId);

  return (
    <div className="min-w-0 flex flex-col">
      <div className="w-full flex justify-center">
        <span className="text-[11px] rounded px-1.5 py-0.5 ring-1 ring-border/60 text-muted-foreground">
          Last {total} matches
        </span>
      </div>

      <div
        className={[
          "mt-1 min-w-0 flex items-center gap-4 text-sm px-0.5 group-last:flex-row-reverse",
          "group-last:flex-row-reverse group-last:text-right",
        ].join(" ")}
      >
        <div className="flex flex-col items-center gap-2">
          <div className={"flex flex-row gap-1"}>
            <img
              src={champImg}
              alt={champName}
              className="w-6 h-6 rounded"
              loading="lazy"
              decoding="async"
            />
            <div className="hidden sm:block truncate max-w-[16ch]" title={champName}>
              {champName}
            </div>
          </div>
          <span className="text-xs text-muted-foreground hidden md:inline">
            {stats.mainPosition}
          </span>
        </div>

        <div className="min-w-[140px] max-w-[200px] flex-1">
          <div className="flex items-baseline justify-between text-xs text-muted-foreground">
            <span>Win rate</span>
            <span className="text-foreground">{winratePct}%</span>
          </div>
          <div className="mt-1 h-1.5 rounded bg-muted/60 overflow-hidden">
            <div className="h-full bg-main/70" style={{ width: `${clamp01(winrate01) * 100}%` }} />
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {stats.wins} W, {stats.losses} L
          </div>
        </div>

        <span
          className={["text-xs px-2 py-0.5 rounded-md ring-1", kdaTone(stats.averageKda)].join(" ")}
          title="Average KDA over last 20 matches"
        >
          {stats.averageKda.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
