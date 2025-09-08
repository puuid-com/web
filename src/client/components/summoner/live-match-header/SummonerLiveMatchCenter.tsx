import { Skeleton } from "@/client/components/ui/skeleton";
import { cn, formatSeconds } from "@/client/lib/utils";
import { CDNService } from "@/shared/services/CDNService";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import { ChampionTooltip } from "@/client/components/tooltips/ChampionTooltip";
import type { LolTierType } from "@/server/types/riot/common";
import React from "react";

type TeamSummary = {
  avgTier?: LolTierType;
  avgRank?: string;
  winrate?: number;
};

type QueueInfo = {
  description?: string | null;
  map?: string;
};

type Ban = { pickTurn: number; championId: number };

type Props = {
  queue: QueueInfo;
  matchSecSinceStartTimer: number;
  red: TeamSummary;
  blue: TeamSummary;
  bansRed: Ban[];
  bansBlue: Ban[];
};

export const SummonerLiveMatchCenter: React.FC<Props> = ({
  queue,
  matchSecSinceStartTimer,
  red,
  blue,
  bansRed,
  bansBlue,
}) => {
  return (
    <div className={"flex flex-col items-center justify-center px-3 min-w-56 gap-1"}>
      <div className={"flex items-center gap-1.5 text-xs leading-none text-muted-foreground"}>
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

      {/* Team summaries */}
      <div className={"mt-0.5 grid grid-cols-3 items-center gap-2 text-xs w-full"}>
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
        <div className={"relative flex items-center justify-center select-none py-0.5"}>
          <div
            className={
              "text-base font-mono px-1.5 py-0.5 rounded-md ring-1 ring-border/60 bg-main/20 text-foreground/90"
            }
          >
            {matchSecSinceStartTimer !== 0 ? (
              formatSeconds(matchSecSinceStartTimer)
            ) : (
              <Skeleton>
                <span className={"invisible select-none"}>20sec</span>
              </Skeleton>
            )}
          </div>
        </div>
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
        <div className={"mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground"}>
          <div className={"flex gap-1"}>
            {bansRed.map((b) => (
              <ChampionTooltip key={`r-${b.pickTurn}`} championId={b.championId}>
                <img
                  src={CDragonService.getChampionSquare(b.championId)}
                  alt=""
                  className={"w-4 h-4 rounded-sm opacity-90 ring-1 ring-border/50"}
                  loading="lazy"
                  decoding="async"
                />
              </ChampionTooltip>
            ))}
          </div>
          <span>Bans</span>
          <div className={"flex gap-1"}>
            {bansBlue.map((b) => (
              <ChampionTooltip key={`b-${b.pickTurn}`} championId={b.championId}>
                <img
                  src={CDragonService.getChampionSquare(b.championId)}
                  alt=""
                  className={"w-4 h-4 rounded-sm opacity-90 ring-1 ring-border/50"}
                  loading="lazy"
                  decoding="async"
                />
              </ChampionTooltip>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

