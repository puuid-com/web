import { SummonerLiveMatchHeaderTeam } from "@/client/components/summoner/live-match-header/SummonerLiveMatchHeaderTeam";
import { Skeleton } from "@/client/components/ui/skeleton";
import { useSummonerLiveMatch } from "@/client/hooks/useSummonerLiveMatch";
import { cn, formatSeconds } from "@/client/lib/utils";
import { getQueueById } from "@/server/services/match/queues.type";
import { Link, useParams } from "@tanstack/react-router";
import { CDNService } from "@/shared/services/CDNService";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import type { LolTierType } from "@/server/types/riot/common";
import React from "react";

type Props = {};

const getSecSinceStart = (start: number) => Math.floor((Date.now() - start) / 1000);

export const SummonerLiveMatchHeader = ({}: Props) => {
  const params = useParams({ from: "/lol/summoner/$riotID" });
  const [matchSecSinceStartTimer, setMatchSecSinceStartTimer] = React.useState(0);
  const { data, status } = useSummonerLiveMatch();

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
  const bansRed = data.bannedChampions.filter((b) => b.teamId === 100 && b.championId > 0);
  const bansBlue = data.bannedChampions.filter((b) => b.teamId === 200 && b.championId > 0);

  return (
    <Link
      to={"/lol/summoner/$riotID/live"}
      params={{ riotID: params.riotID }}
      className={cn(
        "group rounded-xl flex justify-between items-stretch gap-2 p-2",
        "bg-main/10 ring-1 ring-border/60 cursor-pointer hover:bg-main/15 transition-colors",
      )}
      aria-label="Open live match view"
    >
      <SummonerLiveMatchHeaderTeam match={data} teamId={100} />

      <div className={"flex flex-col items-center justify-center px-3 min-w-56 gap-1.5"}>
        <div className={"flex items-center gap-2.5 text-sm text-muted-foreground"}>
          <span className={"relative flex h-2 w-2"}>
            <span
              className={
                "animate-ping absolute inline-flex h-full w-full rounded-full bg-main opacity-75"
              }
            ></span>
            <span className={"relative inline-flex rounded-full h-2 w-2 bg-main"}></span>
          </span>
          <span className={"uppercase tracking-wide font-semibold text-foreground/90"}>
            Live Match
          </span>
          <span className={"text-foreground/70"}>{queue.description ?? queue.map}</span>
        </div>
        <div className={"mt-1 text-base font-mono"}>
          {matchSecSinceStartTimer !== 0 ? (
            formatSeconds(matchSecSinceStartTimer)
          ) : (
            <Skeleton>
              <span className={"invisible select-none"}>20sec</span>
            </Skeleton>
          )}
        </div>

        {/* Team summaries */}
        <div className={"mt-1 grid grid-cols-3 items-center gap-2 text-xs w-full"}>
          <div className={"flex items-center justify-end gap-2 pr-1"}>
            {red.avgTier ? (
              <img
                src={CDNService.getTierImageUrl(red.avgTier)}
                alt={red.avgTier}
                className={"w-6 h-6 drop-shadow"}
                loading="eager"
                decoding="async"
              />
            ) : null}
            <div className={"text-right"}>
              <div className={"leading-none font-medium"}>
                {red.avgTier ? `${red.avgTier} ${red.avgRank ?? ""}` : "—"}
              </div>
              <div className={"text-muted-foreground"}>
                {red.winrate !== undefined ? `${red.winrate}% WR` : ""}
              </div>
            </div>
          </div>
          <div className={"text-center text-muted-foreground select-none"}>vs</div>
          <div className={"flex items-center justify-start gap-2 pl-1"}>
            <div>
              <div className={"leading-none font-medium"}>
                {blue.avgTier ? `${blue.avgTier} ${blue.avgRank ?? ""}` : "—"}
              </div>
              <div className={"text-muted-foreground"}>
                {blue.winrate !== undefined ? `${blue.winrate}% WR` : ""}
              </div>
            </div>
            {blue.avgTier ? (
              <img
                src={CDNService.getTierImageUrl(blue.avgTier)}
                alt={blue.avgTier}
                className={"w-6 h-6 drop-shadow"}
                loading="eager"
                decoding="async"
              />
            ) : null}
          </div>
        </div>

        {/* Bans row if present */}
        {bansRed.length + bansBlue.length > 0 ? (
          <div className={"mt-1 flex items-center gap-2 text-[10px] text-muted-foreground"}>
            <div className={"flex gap-1"}>
              {bansRed.map((b) => (
                <img
                  key={`r-${b.pickTurn}`}
                  src={CDragonService.getChampionSquare(b.championId)}
                  alt=""
                  className={"w-4 h-4 rounded-sm opacity-80"}
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
            <span>Bans</span>
            <div className={"flex gap-1"}>
              {bansBlue.map((b) => (
                <img
                  key={`b-${b.pickTurn}`}
                  src={CDragonService.getChampionSquare(b.championId)}
                  alt=""
                  className={"w-4 h-4 rounded-sm opacity-80"}
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* removed per request: separate Open Live View button */}
      </div>

      <SummonerLiveMatchHeaderTeam match={data} teamId={200} />
    </Link>
  );
};
