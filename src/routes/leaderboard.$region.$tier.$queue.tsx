import { useRef } from "react";

import { Badge } from "@/client/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/client/components/ui/toggle-group";
import { cn } from "@/client/lib/utils";
import { $getLeaderboard, type $GetLeaderboardType } from "@/server/functions/$getLeaderboard";
import {
  CDNService,
  CDragonService,
  LolApexTiers,
  LolQueues,
  LolRegions,
  type LolApexTierType,
  type LolQueueType,
  type LolRegionType,
} from "@puuid/core/shared";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as v from "valibot";
import { TIER_COLOR_VAR } from "@/lib/colors";
import { useUpdateLeaderboard } from "@/client/queries/useUpdateLeaderboard";
import { Button } from "@/client/components/ui/button";
import { Loader2Icon, RefreshCcwDotIcon } from "lucide-react";

export const Route = createFileRoute("/leaderboard/$region/$tier/$queue")({
  component: RouteComponent,
  params: {
    parse: (raw) =>
      v.parse(
        v.object({
          tier: v.picklist(LolApexTiers),
          region: v.picklist(LolRegions),
          queue: v.picklist(LolQueues),
        }),
        raw,
      ),
  },
  loader: async (ctx) => {
    return $getLeaderboard({ data: ctx.params });
  },
});

const PODIUM_ACCENTS = [
  {
    card: "border-amber-400/40 bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-amber-300/5 dark:from-amber-400/20 dark:via-amber-300/10 dark:to-transparent",
    rank: "bg-amber-500 text-amber-50 shadow-amber-500/40",
    badge: "border-amber-500/40 bg-amber-500/15 text-amber-900 dark:text-amber-50",
  },
  {
    card: "border-slate-400/40 bg-gradient-to-br from-slate-400/20 via-slate-300/10 to-slate-200/5 dark:from-slate-500/20 dark:via-slate-400/10 dark:to-transparent",
    rank: "bg-slate-500 text-slate-50 shadow-slate-500/40",
    badge: "border-slate-500/30 bg-slate-500/10 text-slate-900 dark:text-slate-100",
  },
  {
    card: "border-orange-400/40 bg-gradient-to-br from-orange-500/15 via-orange-400/10 to-orange-300/5 dark:from-orange-500/20 dark:via-orange-400/12 dark:to-transparent",
    rank: "bg-orange-500 text-orange-50 shadow-orange-500/40",
    badge: "border-orange-500/40 bg-orange-500/15 text-orange-900 dark:text-orange-50",
  },
] as const;

const QUEUE_LABELS: Record<LolQueueType, string> = {
  RANKED_SOLO_5x5: "Ranked Solo",
  RANKED_FLEX_SR: "Ranked Flex",
} as const;

const ESTIMATED_ROW_HEIGHT = 88;

type LeaderboardEntry = NonNullable<$GetLeaderboardType>["entries"][number];

function RouteComponent() {
  const navigate = Route.useNavigate();
  const params = Route.useParams();
  const leaderboard = Route.useLoaderData();

  const entries = leaderboard?.entries ?? [];
  const podiumEntries = entries.slice(0, 3);
  const remainingEntries = entries.slice(podiumEntries.length);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: remainingEntries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 12,
  });

  const heroTitle = `${formatTier(params.tier)} · ${formatRegion(params.region)} · ${formatQueue(params.queue)}`;

  const handleParamChange = <Key extends keyof typeof params>(
    key: Key,
    value: (typeof params)[Key],
  ) => {
    if (params[key] === value) {
      return;
    }

    void navigate({
      to: ".",
      params: (prev) => ({
        ...prev,
        [key]: value,
      }),
    });
  };

  const $m = useUpdateLeaderboard(params);

  return (
    <div className="container mx-auto max-w-6xl space-y-8 py-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          League of Legends Leaderboard
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{heroTitle}</h1>
        <p className="text-muted-foreground">
          Explore the ladder by region, apex tier, and queue. Use the filters to jump between
          ladders instantly.
        </p>
      </header>

      <section className="space-y-4">
        <RegionFilter
          value={params.region}
          onChange={(value) => {
            handleParamChange("region", value);
          }}
        />
        <TierFilter
          value={params.tier}
          onChange={(value) => {
            handleParamChange("tier", value);
          }}
        />
      </section>

      {!leaderboard ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-12 text-center flex flex-col gap-1.5">
          <p className="text-lg font-semibold">No leaderboard data yet</p>
          <p className="text-sm text-muted-foreground">
            Come back soon—this ladder hasn&apos;t been populated.
          </p>
          <div>
            <Button
              disabled={$m.isPending}
              onClick={() => {
                $m.mutate();
              }}
            >
              {$m.isPending ? <Loader2Icon className={"animate-spin"} /> : <RefreshCcwDotIcon />}
              Update leaderboard
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <TopPlacements entries={podiumEntries} />

          {remainingEntries.length > 0 ? (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Leaderboard
                </h2>
                <Badge variant="secondary" className="text-xs font-medium uppercase tracking-wide">
                  {entries.length.toLocaleString()} players
                </Badge>
              </div>
              <div
                ref={parentRef}
                className="max-h-[70vh] overflow-y-auto rounded-2xl border border-border/60 bg-card/60 shadow-inner"
              >
                <div className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const entry = remainingEntries[virtualRow.index];

                    if (!entry) {
                      return null;
                    }

                    return (
                      <div
                        key={entry.leagueId}
                        ref={rowVirtualizer.measureElement}
                        className={cn(
                          "absolute left-0 top-0 w-full border-b border-border/50 px-6 py-4",
                          virtualRow.index % 2 === 1 && "bg-muted/20",
                        )}
                        style={{
                          transform: `translateY(${virtualRow.start}px)`,
                          willChange: "transform",
                        }}
                      >
                        <LeaderboardRow
                          entry={entry}
                          rank={virtualRow.index + podiumEntries.length + 1}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

type RegionFilterProps = {
  value: LolRegionType;
  onChange: (value: LolRegionType) => void;
};

function RegionFilter({ value, onChange }: RegionFilterProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Region
        </span>
        <Badge
          variant="outline"
          className="border-transparent bg-muted/30 px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground"
        >
          {formatRegion(value)}
        </Badge>
      </div>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(next) => {
          if (!next || next === value) {
            return;
          }
          onChange(next as LolRegionType);
        }}
        variant="outline"
        size="sm"
        className="grid grid-cols-3 gap-1.5 sm:grid-cols-5 lg:grid-cols-8"
      >
        {LolRegions.map((region) => (
          <ToggleGroupItem
            key={region}
            value={region}
            className="h-auto rounded-lg px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide data-[state=on]:border-main/60 data-[state=on]:bg-main/15"
          >
            {formatRegion(region)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

type TierFilterProps = {
  value: LolApexTierType;
  onChange: (value: LolApexTierType) => void;
};

function TierFilter({ value, onChange }: TierFilterProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Tier
        </span>
        <Badge
          variant="outline"
          className="border-transparent bg-muted/30 px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground"
        >
          {formatTier(value)}
        </Badge>
      </div>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(next) => {
          if (!next || next === value) {
            return;
          }
          onChange(next as LolApexTierType);
        }}
        variant="outline"
        style={
          {
            "--color-tier": TIER_COLOR_VAR[value],
          } as React.CSSProperties
        }
        className="flex flex-row justify-center items-center w-full gap-2.5"
      >
        {LolApexTiers.map((tier) => (
          <ToggleGroupItem
            key={tier}
            value={tier}
            className="group h-auto rounded-xl border border-border/40 bg-background/40 px-3 py-3 text-left transition data-[state=on]:ring-tier ring-2 ring-black data-[state=on]:bg-main/10 "
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/40 shadow-inner">
                <img
                  src={CDNService.getMiniTierImageUrl(tier)}
                  alt={`${formatTier(tier)} crest`}
                  className="h-7 w-7"
                />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold leading-tight tracking-tight">
                  {formatTier(tier)}
                </span>
                <span className="text-[11px] text-muted-foreground">Apex ladder</span>
              </span>
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

type TopPlacementsProps = {
  entries: LeaderboardEntry[];
};

function TopPlacements({ entries }: TopPlacementsProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Podium
        </h2>
        <Badge
          variant="outline"
          className="border-transparent bg-muted/30 px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground"
        >
          Top {entries.length}
        </Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {entries.map((entry, index) => {
          const accent = PODIUM_ACCENTS[Math.min(index, PODIUM_ACCENTS.length - 1)]!;

          return (
            <TopPlacementCard key={entry.leagueId} entry={entry} rank={index + 1} accent={accent} />
          );
        })}
      </div>
    </section>
  );
}

type TopPlacementCardProps = {
  entry: LeaderboardEntry;
  rank: number;
  accent: (typeof PODIUM_ACCENTS)[number];
};

function TopPlacementCard({ entry, rank, accent }: TopPlacementCardProps) {
  const wins = entry.league.wins;
  const losses = entry.league.losses;
  const totalGames = wins + losses;
  const winrate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : null;
  const riotIdParam = toSummonerRouteParam(entry.league.summoner.displayRiotId);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border px-6 py-6 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-xl",
        accent.card,
      )}
    >
      <div
        className="absolute -top-16 right-0 h-32 w-32 rounded-full bg-white/10 blur-3xl dark:bg-white/5"
        aria-hidden
      />
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold",
              accent.rank,
            )}
          >
            {rank}
          </div>
          <Link
            to="/lol/summoner/$riotID"
            params={{ riotID: riotIdParam }}
            search={{ q: "solo" }}
            preload="intent"
            className="group flex items-center gap-3 rounded-lg text-foreground outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <img
              src={CDragonService.getProfileIcon(entry.league.summoner.profileIconId)}
              alt=""
              className="h-14 w-14 rounded-full border border-white/40 object-cover shadow-md transition group-hover:scale-105"
            />
            <div>
              <p className="text-lg font-semibold leading-tight">
                {entry.league.summoner.displayRiotId}
              </p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {formatTier(entry.league.tier)} {entry.league.rank}
              </p>
            </div>
          </Link>
        </div>
        <RankDelta currentIndex={entry.dayIndex} previousIndex={entry.lastDayIndex ?? null} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
        <Badge variant="outline" className={cn("border-transparent px-3 py-1", accent.badge)}>
          {entry.league.leaguePoints.toLocaleString()} LP
        </Badge>
        {winrate !== null ? (
          <span className="text-xs text-muted-foreground">
            {winrate}% WR · {wins}W {losses}L
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">No matches recorded</span>
        )}
      </div>
    </div>
  );
}

type LeaderboardRowProps = {
  entry: LeaderboardEntry;
  rank: number;
};

function LeaderboardRow({ entry, rank }: LeaderboardRowProps) {
  const wins = entry.league.wins;
  const losses = entry.league.losses;
  const totalGames = wins + losses;
  const winrate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : null;
  const riotIdParam = toSummonerRouteParam(entry.league.summoner.displayRiotId);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-sm font-semibold">
          {rank}
        </div>
        <Link
          to="/lol/summoner/$riotID"
          params={{ riotID: riotIdParam }}
          search={{ q: "solo" }}
          preload="intent"
          className="group flex items-center gap-3 rounded-lg text-foreground outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          <img
            src={CDragonService.getProfileIcon(entry.league.summoner.profileIconId)}
            alt=""
            className="h-12 w-12 rounded-full border border-border/50 object-cover transition group-hover:scale-105"
          />
          <div>
            <p className="text-sm font-semibold leading-tight">
              {entry.league.summoner.displayRiotId}
            </p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {formatTier(entry.league.tier)} {entry.league.rank}
            </p>
          </div>
        </Link>
      </div>
      <div className="flex items-center justify-between gap-6 md:justify-end">
        <div className="text-right">
          <p className="text-sm font-semibold">{entry.league.leaguePoints.toLocaleString()} LP</p>
          {winrate !== null ? (
            <p className="text-xs text-muted-foreground">
              {winrate}% WR · {wins}W {losses}L
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">No matches</p>
          )}
        </div>
        <RankDelta
          currentIndex={entry.dayIndex}
          previousIndex={entry.lastDayIndex ?? null}
          compact
        />
      </div>
    </div>
  );
}

type RankDeltaProps = {
  currentIndex: number;
  previousIndex: number | null;
  compact?: boolean;
};

function RankDelta({ currentIndex, previousIndex, compact = false }: RankDeltaProps) {
  const sizeClass = compact ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs";

  if (previousIndex === null) {
    return (
      <Badge
        variant="outline"
        className={cn(
          sizeClass,
          "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        )}
      >
        New
      </Badge>
    );
  }

  const delta = previousIndex - currentIndex;

  if (delta === 0) {
    return (
      <Badge variant="outline" className={cn(sizeClass, "border-border/40 text-muted-foreground")}>
        —
      </Badge>
    );
  }

  if (delta > 0) {
    return (
      <Badge
        variant="outline"
        className={cn(
          sizeClass,
          "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        )}
      >
        +{delta}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(sizeClass, "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400")}
    >
      -{Math.abs(delta)}
    </Badge>
  );
}

function toSummonerRouteParam(displayRiotId: string) {
  return displayRiotId.replace("#", "-");
}

function formatTier(tier: string) {
  return toTitleCase(tier.replace(/_/g, " "));
}

function formatQueue(queue: LolQueueType) {
  return QUEUE_LABELS[queue];
}

function formatRegion(region: string) {
  return region.toUpperCase();
}

function toTitleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}
