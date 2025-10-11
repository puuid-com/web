import { SummonerLiveMatchHeaderTeam } from "@/client/components/summoner/live-match-header/SummonerLiveMatchHeaderTeam";
import { useSummonerLiveMatch } from "@/client/hooks/useSummonerLiveMatch";
import { cn, formatSeconds } from "@/client/lib/utils";
import { Link, useParams } from "@tanstack/react-router";
import { SummonerLiveMatchCenter } from "@/client/components/summoner/live-match-header/SummonerLiveMatchCenter";
import { getQueueById, type LolTierType } from "@puuid/core/shared/types/index";
import React from "react";

type Props = {};

const getSecSinceStart = (start: number) => Math.floor((Date.now() - start) / 1000);

export const SummonerLiveMatchHeader = ({}: Props) => {
  const params = useParams({ from: "/lol/summoner/$riotID" });
  const [matchSecSinceStartTimer, setMatchSecSinceStartTimer] = React.useState(0);
  const { data, status } = useSummonerLiveMatch();

  // console.debug({ data, status });

  React.useEffect(() => {
    if (status !== "success" || !data) return;

    // initialize immediately to avoid a 1s skeleton flash
    setMatchSecSinceStartTimer(getSecSinceStart(data.gameStartTime));

    const interval = setInterval(() => {
      setMatchSecSinceStartTimer(getSecSinceStart(data.gameStartTime));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [data, status]);

  if (status !== "success" || !data) return null;

  const queue = getQueueById(data.gameQueueConfigId);

  if (!queue) return null;

  // Helpers for team summaries
  const TIER_ORDER: LolTierType[] = [
    "IRON",
    "BRONZE",
    "SILVER",
    "GOLD",
    "PLATINUM",
    "EMERALD",
    "DIAMOND",
    "MASTER",
    "GRANDMASTER",
    "CHALLENGER",
  ];
  const RANK_ORDER = ["IV", "III", "II", "I"] as const;
  const scoreFromLeague = (l?: { tier: LolTierType; rank: string | null }) => {
    if (!l) return undefined;
    const t = TIER_ORDER.indexOf(l.tier);
    const r = l.rank ? RANK_ORDER.indexOf(l.rank as (typeof RANK_ORDER)[number]) : 3; // Master+ no rank
    if (t < 0) return undefined;
    return t * 4 + Math.max(0, r);
  };
  const leagueFromScore = (s: number): { tier: LolTierType; rank: (typeof RANK_ORDER)[number] } => {
    const t = Math.min(TIER_ORDER.length - 1, Math.max(0, Math.floor(s / 4)));
    const r = Math.min(3, Math.max(0, Math.round(s % 4)));
    return { tier: TIER_ORDER[t]!, rank: RANK_ORDER[r]! };
  };
  const summarizeTeam = (teamId: 100 | 200) => {
    const players = data.participants.filter((p) => p.teamId === teamId);
    const leagues = players.map((p) => p.stats?.league ?? null).filter(Boolean) as {
      tier: LolTierType;
      rank: string | null;
      wins: number;
      losses: number;
    }[];
    const scores = leagues
      .map((l) => scoreFromLeague(l))
      .filter((n): n is number => typeof n === "number");
    const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : undefined;
    const derived = typeof avgScore === "number" ? leagueFromScore(avgScore) : undefined;
    const wins = leagues.reduce((a, l) => a + l.wins, 0);
    const losses = leagues.reduce((a, l) => a + l.losses, 0);
    const wr = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : undefined;
    return {
      avgTier: derived?.tier,
      avgRank: derived?.rank,
      winrate: wr,
    } as const;
  };

  const red = summarizeTeam(100);
  const blue = summarizeTeam(200);

  // Bans
  const bansRed = data.bannedChampions
    .filter((b) => b.teamId === 100 && b.championId > 0)
    .sort((a, b) => a.pickTurn - b.pickTurn);
  const bansBlue = data.bannedChampions
    .filter((b) => b.teamId === 200 && b.championId > 0)
    .sort((a, b) => a.pickTurn - b.pickTurn);

  return (
    <Link
      to={"/lol/summoner/$riotID/live"}
      search={{ q: "solo" }}
      params={{ riotID: params.riotID }}
      className={cn(
        "group rounded-xl flex justify-between items-center gap-2 p-2",
        "bg-main/10 text-main ring-1 ring-main/30 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)] cursor-pointer hover:bg-main/20 transition-colors",
      )}
      aria-label={`Live match ${matchSecSinceStartTimer ? formatSeconds(matchSecSinceStartTimer) : ""} - ${red.avgTier ?? "?"} vs ${blue.avgTier ?? "?"}`}
    >
      <SummonerLiveMatchHeaderTeam match={data} teamId={100} />

      <SummonerLiveMatchCenter
        queue={queue.queue}
        matchSecSinceStartTimer={matchSecSinceStartTimer}
        red={red}
        blue={blue}
        bansRed={bansRed}
        bansBlue={bansBlue}
      />

      <SummonerLiveMatchHeaderTeam match={data} teamId={200} />
    </Link>
  );
};
