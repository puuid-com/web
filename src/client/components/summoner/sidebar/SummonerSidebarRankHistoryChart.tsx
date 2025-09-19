import { CDNService } from "@/shared/services/CDNService";
import { LeagueTierOrder, LeagueToLP } from "@/shared/util";
import type { LeagueRowType } from "@/server/db/schema/league";
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

type HistoryTooltipProps = TooltipProps<number, string> & {
  payload?: Payload<number, string>[];
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

  const renderTooltip = ({ active, payload }: HistoryTooltipProps) => {
    if (!active || !payload || payload.length === 0) return null;
    const firstEntry = payload[0];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dataPoint = firstEntry?.payload;
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
    <div className="h-36 w-full">
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
              strokeOpacity={0.8}
              label={<TierReferenceLabel tier={marker.tier} />}
            />
          ))}
          <Tooltip content={renderTooltip} />
          <Line
            type="monotone"
            dataKey="normalizedLp"
            stroke="var(--color-main)"
            strokeWidth={3}
            dot={{ r: 3, stroke: "var(--color-main)", strokeWidth: 1 }}
            activeDot={{ r: 5, stroke: "var(--color-main)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
