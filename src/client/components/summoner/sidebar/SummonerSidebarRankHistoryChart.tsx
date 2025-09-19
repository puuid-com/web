import { CDNService } from "@puuid/core/shared/services/CDNService";
import type { LeagueRowType } from "@puuid/core/server/db/schema/league";
import { LeagueTierOrder, LeagueToLP } from "@puuid/core/lib/lp";
import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LabelProps, TooltipProps } from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import type { CartesianViewBoxRequired } from "recharts/types/util/types";

type Props = {
  leagues: LeagueRowType[];
};

type HistoryPoint = {
  id: string;
  timestamp: number;
  date: Date;
  leaguePoints: number;
  normalizedLp: number;
  tier: LeagueRowType["tier"];
  rank: LeagueRowType["rank"];
  wins: number;
  losses: number;
};

type TierMarker = {
  tier: LeagueRowType["tier"];
  value: number;
};

type SegmentPoint = Pick<HistoryPoint, "timestamp" | "normalizedLp">;

type TierSegment = {
  id: string;
  startTier: LeagueRowType["tier"];
  endTier: LeagueRowType["tier"];
  points: [SegmentPoint, SegmentPoint];
};

type HistoryTooltipPayload = Payload<number, string> & { payload: HistoryPoint };

type HistoryTooltipProps = TooltipProps<number, string> & {
  payload?: HistoryTooltipPayload[];
};

const isHistoryPoint = (value: unknown): value is HistoryPoint => {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<HistoryPoint>;
  return (
    typeof candidate.leaguePoints === "number" &&
    typeof candidate.normalizedLp === "number" &&
    candidate.date instanceof Date &&
    typeof candidate.timestamp === "number" &&
    typeof candidate.tier === "string"
  );
};

const TierReferenceLabel = ({ viewBox, tier }: LabelProps & { tier: TierMarker["tier"] }) => {
  if (!viewBox) return null;
  const { x = 0, y = 0 } = viewBox as CartesianViewBoxRequired;
  const size = 18;
  const imgX = Math.max(x - size - 8, 0);
  const imgY = y - size / 2;

  return (
    <g transform={`translate(${imgX}, ${imgY})`}>
      <image
        href={CDNService.getMiniTierImageUrl(tier)}
        width={size}
        height={size}
        aria-hidden="true"
      />
    </g>
  );
};

const TIER_COLOR_VAR: Record<LeagueRowType["tier"], string> = {
  IRON: "var(--color-tier-iron)",
  BRONZE: "var(--color-tier-bronze)",
  SILVER: "var(--color-tier-silver)",
  GOLD: "var(--color-tier-gold)",
  PLATINUM: "var(--color-tier-platinum)",
  EMERALD: "var(--color-tier-emerald)",
  DIAMOND: "var(--color-tier-diamond)",
  MASTER: "var(--color-tier-master)",
  GRANDMASTER: "var(--color-tier-grandmaster)",
  CHALLENGER: "var(--color-tier-challenger)",
};

const formatGain = (value: number | null) => {
  if (value === null) return "--";
  if (value > 0) return `+${value}`;
  return `${value}`;
};

const GainPill = ({ label, value }: { label: string; value: number | null }) => {
  let tone = "text-slate-400";
  if (value !== null) {
    if (value > 0) tone = "text-emerald-400";
    else if (value < 0) tone = "text-rose-400";
  }

  return (
    <div className="flex items-center gap-2 rounded-md bg-slate-950/70 px-2 py-1 text-[11px]">
      <span className="uppercase tracking-wide text-slate-500">{label}</span>
      <span className={`font-bold ${tone}`}>{formatGain(value)} LP</span>
    </div>
  );
};

export function SummonerSidebarRankHistoryChart({ leagues }: Props) {
  const history = useMemo<HistoryPoint[]>(() => {
    if (!leagues.length) return [];

    return [...leagues]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((entry) => {
        const date = new Date(entry.createdAt);
        return {
          id: entry.id,
          timestamp: date.getTime(),
          date,
          leaguePoints: entry.leaguePoints,
          normalizedLp: LeagueToLP(entry),
          tier: entry.tier,
          rank: entry.rank,
          wins: entry.wins,
          losses: entry.losses,
        };
      });
  }, [leagues]);

  const axisFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }),
    [],
  );

  const tooltipFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }),
    [],
  );

  const tierMarkers = useMemo<TierMarker[]>(() => {
    if (!history.length) return [];

    const tierMinMap = new Map<LeagueRowType["tier"], number>();
    for (const point of history) {
      const currentMin = tierMinMap.get(point.tier);
      if (typeof currentMin !== "number" || point.normalizedLp < currentMin) {
        tierMinMap.set(point.tier, point.normalizedLp);
      }
    }

    const markers: TierMarker[] = [];
    for (const tier of LeagueTierOrder) {
      const value = tierMinMap.get(tier);
      if (typeof value === "number") {
        markers.push({ tier, value });
      }
    }

    return markers;
  }, [history]);

  const tierSegments = useMemo<TierSegment[]>(() => {
    if (history.length < 2) return [];

    const segments: TierSegment[] = [];

    for (let i = 0; i < history.length - 1; i++) {
      const current = history[i]!;
      const next = history[i + 1]!;

      segments.push({
        id: `${current.id}-${next.id}`,
        startTier: current.tier,
        endTier: next.tier,
        points: [
          { timestamp: current.timestamp, normalizedLp: current.normalizedLp },
          { timestamp: next.timestamp, normalizedLp: next.normalizedLp },
        ],
      });
    }

    return segments;
  }, [history]);

  const lpGains = useMemo(() => {
    if (!history.length) {
      return { last30Days: null, last7Days: null } as const;
    }

    const latest = history[history.length - 1]!;
    const computeGain = (days: number) => {
      const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
      if (latest.timestamp < threshold) return null;
      const baseline = history.find((point) => point.timestamp >= threshold);
      if (!baseline) return null;
      const diff = latest.normalizedLp - baseline.normalizedLp;
      return Math.round(diff);
    };

    return {
      last30Days: computeGain(30),
      last7Days: computeGain(7),
    } as const;
  }, [history]);

  const renderTooltip = ({ active, payload }: HistoryTooltipProps) => {
    if (!active || !payload || payload.length === 0) return null;
    const firstEntry = payload[0];
    if (!firstEntry) return null;
    const dataPoint = firstEntry.payload as HistoryTooltipPayload;
    if (!isHistoryPoint(dataPoint)) return null;

    const rankLabel = [dataPoint.tier, dataPoint.rank].filter(Boolean).join(" ") || dataPoint.tier;

    return (
      <div className="bg-slate-950/90 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 shadow-lg">
        <div className="font-semibold text-slate-100">
          {tooltipFormatter.format(dataPoint.date)}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <img alt="" src={CDNService.getMiniTierImageUrl(dataPoint.tier)} className="w-5 h-5" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-100">{rankLabel}</span>
            <span className="text-slate-300">{dataPoint.leaguePoints} LP</span>
          </div>
        </div>
      </div>
    );
  };

  if (!history.length) {
    return (
      <div className="text-xs text-muted-foreground text-center">No historical league data</div>
    );
  }

  return (
    <div className="flex h-36 w-full flex-col">
      <div className="flex items-center justify-between px-1 pb-1 text-xs font-semibold text-slate-300">
        <GainPill label="Last 30d" value={lpGains.last30Days} />
        <GainPill label="Last 7d" value={lpGains.last7Days} />
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" strokeOpacity={0.6} />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={["auto", "auto"]}
              tickFormatter={(value) => axisFormatter.format(new Date(Number(value)))}
              stroke="#64748b"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#1e293b" }}
            />
            <YAxis dataKey="normalizedLp" domain={["dataMin", "dataMax"]} hide />
            {tierMarkers.map((marker) => (
              <ReferenceLine
                key={marker.tier}
                y={marker.value}
                stroke={TIER_COLOR_VAR[marker.tier]}
                strokeDasharray="4 4"
                strokeOpacity={0.6}
                label={<TierReferenceLabel tier={marker.tier} />}
              />
            ))}
            <Tooltip content={renderTooltip} />
            <Line
              type="monotone"
              dataKey="normalizedLp"
              stroke="transparent"
              strokeWidth={3}
              dot={false}
              activeDot={(props) => {
                const {
                  cx = 0,
                  cy = 0,
                  payload: rawPayload,
                } = props as {
                  cx: number;
                  cy: number;
                  payload: HistoryTooltipPayload;
                };
                const point = isHistoryPoint(rawPayload) ? rawPayload : null;
                const fill = point ? TIER_COLOR_VAR[point.tier] : "var(--color-main)";
                return (
                  <circle cx={cx} cy={cy} r={5.5} fill={fill} stroke={fill} strokeWidth={1.5} />
                );
              }}
              isAnimationActive={false}
            />
            <defs>
              {tierSegments.map((segment) => {
                const gradientId = `tier-gradient-${segment.id}`;
                return (
                  <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={TIER_COLOR_VAR[segment.startTier]} />
                    <stop offset="40%" stopColor={TIER_COLOR_VAR[segment.startTier]} />
                    <stop offset="60%" stopColor={TIER_COLOR_VAR[segment.endTier]} />
                    <stop offset="100%" stopColor={TIER_COLOR_VAR[segment.endTier]} />
                  </linearGradient>
                );
              })}
            </defs>
            {tierSegments.map((segment) => (
              <Line
                key={segment.id}
                type="linear"
                data={segment.points}
                dataKey="normalizedLp"
                stroke={`url(#tier-gradient-${segment.id})`}
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
                connectNulls
                activeDot={false}
                strokeLinecap="round"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
