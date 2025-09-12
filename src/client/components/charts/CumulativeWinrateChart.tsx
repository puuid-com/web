import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  Line,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";

export type MatchPoint = {
  datetime: string | Date;
  win: boolean;
};

type DailyCumulative = {
  date: string; // YYYY-MM-DD
  dailyWins: number;
  dailyLosses: number;
  dailyTotal: number;
  cumWins: number;
  cumLosses: number;
  cumTotal: number;
  cumWinRate: number; // 0..100
  revWins: number;
  revLosses: number;
  revTotal: number;
  revWinRate: number; // 0..100
};

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function buildDailyCumulative(data: MatchPoint[]): DailyCumulative[] {
  const dayMap = new Map<string, { wins: number; losses: number }>();
  for (const m of data) {
    const d = new Date(m.datetime);
    const key = dateKey(d);
    const agg = dayMap.get(key) ?? { wins: 0, losses: 0 };
    if (m.win) agg.wins += 1;
    else agg.losses += 1;
    dayMap.set(key, agg);
  }

  const days = Array.from(dayMap.keys()).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const out: DailyCumulative[] = [];
  let cumWins = 0;
  let cumLosses = 0;
  for (const day of days) {
    const { wins, losses } = dayMap.get(day)!;
    cumWins += wins;
    cumLosses += losses;
    const cumTotal = cumWins + cumLosses;
    out.push({
      date: day,
      dailyWins: wins,
      dailyLosses: losses,
      dailyTotal: wins + losses,
      cumWins,
      cumLosses,
      cumTotal,
      cumWinRate: cumTotal ? (cumWins / cumTotal) * 100 : 0,
      revWins: 0,
      revLosses: 0,
      revTotal: 0,
      revWinRate: 0,
    });
  }

  let suffixWins = 0;
  let suffixLosses = 0;
  for (let i = out.length - 1; i >= 0; i--) {
    suffixWins += out[i]!.dailyWins;
    suffixLosses += out[i]!.dailyLosses;
    const t = suffixWins + suffixLosses;
    out[i]!.revWins = suffixWins;
    out[i]!.revLosses = suffixLosses;
    out[i]!.revTotal = t;
    out[i]!.revWinRate = t ? (suffixWins / t) * 100 : 0;
  }

  return out;
}

type Props = {
  data: MatchPoint[];
};

export function CumulativeWinrateChart({ data }: Props) {
  const cumulativeByDay = React.useMemo(() => buildDailyCumulative(data), [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          Fig. 1: Cumulative Win Rate by Date
        </CardTitle>
        <CardDescription className="text-gray-400">
          Running winrate across calendar days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cumulativeByDay} margin={{ top: 30, right: 30, left: 10, bottom: 10 }}>
              <Legend verticalAlign="top" height={24} />
              <defs>
                <linearGradient id="cumWinGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-main)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-main)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tick={{ fill: "#9ca3af" }} />
              <YAxis
                yAxisId="left"
                stroke="#9ca3af"
                fontSize={12}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              {/* Right Y-axis removed since cumulative games line is removed */}
              <ReferenceLine yAxisId="left" y={50} stroke="#6b7280" strokeDasharray="6 6" />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || payload.length === 0) return null;
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  const p = payload[0]!.payload as DailyCumulative;
                  return (
                    <div className="bg-neutral-900 border rounded-lg p-3 shadow-lg">
                      <p className="text-gray-300 text-sm font-medium">{p.date}</p>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-main font-semibold">
                          Cumulative Winrate: {p.cumWinRate.toFixed(1)}%
                        </p>
                        <p className="font-semibold" style={{ color: "#a78bfa" }}>
                          Reverse Cumulative: {p.revWinRate.toFixed(1)}%
                        </p>
                        {/* Group games percent removed */}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        <p>
                          Day: W {p.dailyWins} · L {p.dailyLosses} · {p.dailyTotal} games
                        </p>
                        <p>
                          Total: W {p.cumWins} · L {p.cumLosses} · {p.cumTotal} games
                        </p>
                      </div>
                    </div>
                  );
                }}
              />
              <Line
                name="Cumulative Winrate"
                yAxisId="left"
                type="monotone"
                dataKey="cumWinRate"
                stroke="var(--color-main)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, stroke: "var(--color-main)", strokeWidth: 2 }}
              />
              <Line
                name="Reverse Cumulative Winrate"
                yAxisId="left"
                type="monotone"
                dataKey="revWinRate"
                stroke="#a78bfa"
                strokeDasharray="6 4"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, stroke: "#a78bfa", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
