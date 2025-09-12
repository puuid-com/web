import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  ReferenceLine,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client/components/ui/card";

export type MatchPoint = {
  datetime: string | Date;
  win: boolean;
};

type HourBin = {
  hour: number;
  wins: number;
  losses: number;
  total: number;
  winRate: number;
};

function buildBins(data: MatchPoint[]): HourBin[] {
  const bins: HourBin[] = Array.from({ length: 24 }, (_, hour) => ({ hour, wins: 0, losses: 0, total: 0, winRate: 0 }));

  for (const m of data) {
    const d = new Date(m.datetime);
    const h = d.getHours();
    if (m.win) bins[h]!.wins += 1;
    else bins[h]!.losses += 1;
  }

  for (const b of bins) {
    b.total = b.wins + b.losses;
    b.winRate = b.total ? Math.round((b.wins / b.total) * 100) : 0;
  }
  return bins;
}

interface TooltipProps {
  active?: boolean;
  payload?: {
    payload: HourBin;
  }[];
  label?: number;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload?.length) {
    const data = payload[0]!.payload;
    return (
      <div className="bg-neutral-900 border rounded-lg p-3 shadow-lg">
        <p className="text-gray-300 text-sm font-medium">{`${label}:00 - ${(label! + 1) % 24}:00`}</p>
        <p className="text-main font-semibold">Win Rate: {data.winRate.toFixed(1)}%</p>
        <div className="text-xs text-gray-400 mt-1">
          <p>Wins: {data.wins} | Losses: {data.losses}</p>
          <p className="font-medium text-yellow-400">Total Games: {data.total}</p>
          {data.total < 5 && <p className="text-orange-400 font-medium mt-1">⚠️ Small sample size</p>}
        </div>
      </div>
    );
  }
  return null;
};

type Props = {
  data: MatchPoint[];
};

export function HourlyWinrateChart({ data }: Props) {
  const hourlyData = React.useMemo(() => buildBins(data), [data]);

  const getDotSize = (total: number) => {
    const minSize = 3;
    const maxSize = 8;
    const minGames = Math.min(...hourlyData.map((d) => d.total));
    const maxGames = Math.max(...hourlyData.map((d) => d.total));
    if (maxGames === minGames) return minSize;
    const normalized = (total - minGames) / (maxGames - minGames);
    return minSize + (maxSize - minSize) * normalized;
  };

  const maxWinRate = Math.max(...hourlyData.map((d) => d.winRate));
  const avgWinRate = hourlyData.reduce((sum, d) => sum + d.winRate, 0) / hourlyData.length;
  const peakHour = hourlyData.find((d) => d.winRate === maxWinRate)?.hour ?? 0;
  const minGames = Math.min(...hourlyData.map((d) => d.total));
  const maxGames = Math.max(...hourlyData.map((d) => d.total));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          Fig. 2: Win Rate by Hour
        </CardTitle>
        <CardDescription className="text-gray-400">Performance analysis across 24 hour periods</CardDescription>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-gray-300">Peak: {maxWinRate.toFixed(1)}% at {peakHour}:00</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-300">Average: {avgWinRate.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            </div>
            <span className="text-gray-300">Dot size = Games ({minGames}-{maxGames})</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 40, right: 30, left: 20, bottom: 20 }}>
              <ReferenceLine y={avgWinRate} stroke="var(--color-main)" strokeWidth={2} strokeDasharray="8 4" />
              <defs>
                <linearGradient id="winRateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-main)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-main)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
              <XAxis dataKey="hour" stroke="#9ca3af" fontSize={12} tickFormatter={(hour) => `${hour}:00`} interval={1} />
              <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="winRate"
                stroke="var(--color-main)"
                strokeWidth={3}
                fill="url(#winRateGradient)"
                dot={(props) => {
                  const { cx, cy, payload } = props as { cx: number; cy: number; payload: HourBin };
                  const size = getDotSize(payload.total);
                  return (
                    <circle cx={cx} cy={cy} r={size} fill="var(--color-neutral-900)" stroke="var(--color-main)" strokeWidth={2} />
                  );
                }}
                activeDot={{ r: 8, stroke: "var(--color-main)", strokeWidth: 2, fill: "var(--color-neutral-900)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

