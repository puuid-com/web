import { cn } from "@/client/lib/utils";
import { Link } from "@tanstack/react-router";
import { LolApexTiers, type LolApexTierType } from "@puuid/core/shared";
import { CDNService } from "@puuid/core/shared/services/CDNService";
import type { LeaderboardEntryRowType } from "@puuid/core/server/db/schema/leaderboard";
import type { LeagueRowType } from "@puuid/core/server/db/schema/league";
import { ArrowDownRight, ArrowUpRight, Minus, Sparkles } from "lucide-react";

type Props = {
  tier: LeagueRowType["tier"];
  queueType: LeagueRowType["queueType"];
  region: LeagueRowType["region"];
  leaderboardEntry: LeaderboardEntryRowType | null;
};

export const SummonerSidebarRankLeaderboard = ({
  tier,
  queueType,
  region,
  leaderboardEntry,
}: Props) => {
  if (!leaderboardEntry) {
    return null;
  }

  const isApexTier = (value: LeagueRowType["tier"]): value is LolApexTierType =>
    LolApexTiers.includes(value as LolApexTierType);

  if (!isApexTier(tier)) {
    return null;
  }

  const currentLeaderboardPosition = leaderboardEntry.dayIndex + 1;
  const leaderboardDelta =
    leaderboardEntry.lastDayIndex != null
      ? leaderboardEntry.lastDayIndex - leaderboardEntry.dayIndex
      : null;

  const leaderboardDeltaText =
    leaderboardDelta != null
      ? leaderboardDelta > 0
        ? `+${leaderboardDelta}`
        : leaderboardDelta < 0
          ? `${leaderboardDelta}`
          : "0"
      : "NEW";

  const leaderboardDeltaColor =
    leaderboardDelta != null
      ? leaderboardDelta > 0
        ? "text-emerald-400"
        : leaderboardDelta < 0
          ? "text-red-400"
          : "text-muted-foreground"
      : "text-main";

  const LeaderboardDeltaIcon =
    leaderboardDelta != null
      ? leaderboardDelta > 0
        ? ArrowUpRight
        : leaderboardDelta < 0
          ? ArrowDownRight
          : Minus
      : Sparkles;

  const currentPositionLabel = `#${currentLeaderboardPosition.toLocaleString()}`;

  const params = {
    region,
    tier,
    queue: queueType,
  } as const;

  return (
    <Link
      to="/leaderboard/$region/$tier/$queue"
      params={params}
      className={cn(
        "group flex items-center justify-between gap-2 rounded-md border border-main/25 bg-main/10 px-2 py-1.5 text-xs transition hover:border-main/50 hover:bg-main/15",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-background/70 shadow-sm">
          <img src={CDNService.getMiniTierImageUrl(tier)} aria-hidden alt="" className="h-4 w-4" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-lg font-semibold text-main">{currentPositionLabel}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div
          className={cn(
            "flex items-center gap-1 rounded-full bg-background/70 px-2 py-0.5",
            leaderboardDeltaColor,
          )}
        >
          <LeaderboardDeltaIcon className="h-3 w-3" />
          <span className="text-[10px] font-semibold uppercase tracking-wide">
            {leaderboardDeltaText}
          </span>
        </div>
      </div>
    </Link>
  );
};
