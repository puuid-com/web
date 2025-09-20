import React from "react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { Separator } from "@/client/components/ui/separator";
import { ExternalLink, NotebookPenIcon } from "lucide-react";
import { CDragonService } from "@puuid/core/shared/services/CDragonService";
import { timeago, formatSeconds } from "@/client/lib/utils";

import { MainChampionProvider } from "@/client/context/MainChampionContext";
import type { $GetFollowingType } from "@/server/functions/$getFollowing";
import { getQueueById } from "@puuid/core/shared/types/index";

type Props = {
  item: $GetFollowingType[number];
  start: number;
  index: number;
  measureElement: (el: Element | null) => void;
  onUnfollow: (puuid: string) => void;
};

export const FollowingPost: React.FC<Props> = ({
  item,
  start,
  index,
  measureElement,
  onUnfollow,
}) => {
  const summoner = item.summoner;
  const [gameName, tagLine] = summoner.displayRiotId.split("#");
  const note = summoner.notes.at(0);

  const stats =
    summoner.statistics.find((s) => s.queueType === "RANKED_SOLO_5x5") ??
    summoner.statistics.find((s) => s.queueType === "RANKED_FLEX_SR");

  const lastMatchSummoner = summoner.matchSummoner.at(0);
  const lastMatch = lastMatchSummoner ? lastMatchSummoner.match : undefined;

  // Header: author info and timestamp
  const Header = (
    <header className="rounded-t-xl border-b-2 border-main/20 bg-main/5">
      <div className="flex items-start gap-3 p-3 sm:p-4">
        <img
          className="w-11 h-11 rounded-full border ring-1 ring-main/30"
          src={CDragonService.getProfileIcon(summoner.profileIconId)}
          alt="profile icon"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              to={"/lol/summoner/$riotID/matches"}
              params={{ riotID: summoner.riotId.replace("#", "-") }}
              search={{ q: "solo", p: 1 }}
              target="_blank"
              className="hover:underline font-semibold text-foreground truncate text-sm sm:text-base"
            >
              {gameName}
            </Link>
            <span className="text-main/90 text-xs sm:text-sm">#{tagLine}</span>
            <span
              className="text-xs text-neutral-500 ml-auto"
              title={new Date(
                (lastMatch?.gameCreationMs ?? item.createdAt) as number,
              ).toLocaleString()}
            >
              {lastMatch
                ? `Last match ${timeago(lastMatch.gameCreationMs)}`
                : `Followed ${timeago(item.createdAt)}`}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="gap-1 uppercase text-[10px]">
              {summoner.region}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              Lv. {summoner.summonerLevel}
            </Badge>
            {note ? (
              <Badge variant="secondary" className="gap-1 max-w-[50%] truncate">
                <NotebookPenIcon className="w-3 h-3" />{" "}
                <span className="truncate">{note.note}</span>
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );

  // Body: match content and actions
  const Body = (
    <section className="p-3 sm:p-4">
      {lastMatch && lastMatchSummoner ? (
        <div>
          <div className="flex items-center gap-3">
            <img
              className={"w-12 h-12 rounded-md border shadow-sm ring-1 ring-black/20"}
              src={CDragonService.getChampionSquare(lastMatchSummoner.championId)}
              alt="champion"
            />
            <div className="text-sm leading-tight">
              <div className="flex items-center gap-2">
                <span className={lastMatchSummoner.win ? "text-emerald-400" : "text-red-400"}>
                  {lastMatchSummoner.win ? "Win" : "Defeat"}
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-300">
                  {lastMatchSummoner.kills}/{lastMatchSummoner.deaths}/{lastMatchSummoner.assists}
                </span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-300">{lastMatchSummoner.cs} CS</span>
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                {(() => {
                  const queue = getQueueById(lastMatch.queueId);
                  return [
                    queue?.description ?? queue?.map ?? `Queue ${lastMatch.queueId}`,
                    formatSeconds(lastMatch.gameDurationSec),
                    `Match ${lastMatch.matchId}`,
                  ]
                    .filter(Boolean)
                    .join(" • ");
                })()}
              </div>
            </div>
          </div>

          {/* meta badges moved to header */}
        </div>
      ) : (
        <div className="text-sm text-neutral-400">No recent matches</div>
      )}

      <Separator className="my-4 opacity-60" />

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link
            to={"/lol/summoner/$riotID/matches"}
            params={{ riotID: summoner.riotId.replace("#", "-") }}
            search={{ q: "solo", p: 1 }}
            target="_blank"
          >
            <ExternalLink className="w-4 h-4" /> View profile
          </Link>
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            onUnfollow(summoner.puuid);
          }}
        >
          Unfollow
        </Button>
      </div>
    </section>
  );

  return (
    <MainChampionProvider statistic={stats ?? null}>
      <div
        ref={measureElement}
        data-index={index}
        className="absolute left-0 top-0 w-full p-2"
        style={{ transform: `translateY(${String(start)}px)` }}
      >
        <article className="w-full rounded-xl border bg-card/60 backdrop-blur-sm">
          {Header}
          {Body}
        </article>
      </div>
    </MainChampionProvider>
  );
};
