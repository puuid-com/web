import { Badge } from "@/client/components/ui/badge";
import { Card } from "@/client/components/ui/card";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import { useLoaderData } from "@tanstack/react-router";
import React from "react";
import * as htmlToImage from "html-to-image";
import { useMutation } from "@tanstack/react-query";
import { $postSummonerProfile } from "@/server/functions/$postSummonerProfile";
import type { MatchWithSummonersType } from "@/server/db/schema/match";
import type { SummonerType } from "@/server/db/schema/summoner";

interface SummonerProfileCardProps {
  summoner: SummonerType;
  matches: MatchWithSummonersType[];
  disableAutoUpload?: boolean;
}

export function SummonerProfileCard({
  matches,
  summoner,
  disableAutoUpload,
}: SummonerProfileCardProps) {
  const metadata = useLoaderData({ from: "/lol" });
  const ref = React.useRef<HTMLDivElement>(null);
  const saved = React.useRef(false);

  const mutation = useMutation({
    mutationKey: ["summoner-profile", summoner.puuid],
    mutationFn: (data: { imageSrc: string }) =>
      $postSummonerProfile({
        data: {
          puuid: summoner.puuid,
          imageSrc: data.imageSrc,
        },
      }),
  });

  // Calculate win rate
  const wins = matches.filter(
    (match) => match.summoners.find((p) => p.puuid === summoner.puuid)!.win,
  ).length;
  const winRate = Math.round((wins / matches.length) * 100);

  React.useEffect(() => {
    if (disableAutoUpload) return;
    if (!ref.current || saved.current) return;

    htmlToImage
      .toPng(ref.current)
      .then((dataUrl) => {
        const img = new Image();
        img.src = dataUrl;

        mutation
          .mutateAsync({ imageSrc: dataUrl })
          .catch(console.error)
          .finally(() => {
            saved.current = true;
          });
      })
      .catch((err: unknown) => {
        console.error("oops, something went wrong!", err);
      });
  }, [disableAutoUpload, mutation]);

  return (
    <Card
      data-capture-root
      ref={ref}
      className="w-full max-w-md bg-transparent text-white p-3 border-0 shadow-none h-fit"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={CDragonService.getProfileIcon(summoner.profileIconId) || "/placeholder.svg"}
                alt="Profile Icon"
                className="w-12 h-12 rounded-full border-2 border-yellow-400"
              />
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-xs font-bold px-1 py-0.5 rounded-full leading-none">
                {summoner.summonerLevel}
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="font-bold text-sm">{summoner.riotId}</h2>
              <p className="text-xs text-blue-200 uppercase tracking-wide">{summoner.region}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-blue-200">WR:</span>
                <span className="font-bold text-sm text-green-400">{winRate}%</span>
              </div>
            </div>
          </div>
          <div className="text-sm font-bold text-neutral-300">puuid.com</div>
        </div>

        <div className="flex-1">
          <h3 className="text-xs font-semibold text-blue-200 mb-2">RECENT MATCHES</h3>
          <div className="grid grid-cols-5 gap-1">
            {matches.map((match, index) => {
              const ms = match.summoners.find((p) => p.puuid === summoner.puuid)!;
              const championName = metadata.champions[ms.championId]!.name;
              const position = ms.individualPosition;
              const kda = `${ms.kills}/${ms.deaths}/${ms.assists}`;

              return (
                <div
                  key={index}
                  className={`flex flex-col items-center p-1 rounded text-center ${
                    ms.win ? "bg-green-800/30" : "bg-red-800/30"
                  }`}
                >
                  <img
                    src={CDragonService.getChampionSquare(ms.championId) || "/placeholder.svg"}
                    alt={championName}
                    className="w-12 h-12 rounded border border-slate-600 mb-1"
                  />

                  <Badge
                    variant="secondary"
                    className={`text-xs px-1 py-0 mb-1 ${
                      ms.win ? "bg-green-700 text-green-100" : "bg-red-700 text-red-100"
                    }`}
                  >
                    {ms.win ? "W" : "L"}
                  </Badge>

                  <div className="text-xs font-mono text-slate-300 leading-tight">{kda}</div>
                  <div className="text-xs text-blue-200 truncate w-full">{position}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
