import { MatchItemChampionName } from "@/client/components/match-list/MatchItemChampionName";
import { cn, formatSeconds } from "@/client/lib/utils";
import { DDragonService } from "@/client/services/DDragon";
import type { $GetSummonerMatchesType } from "@/server/functions/$getSummonerMatches";
import { useLoaderData } from "@tanstack/react-router";

type Props = {
  m: $GetSummonerMatchesType["matches"][number]["match"];
  p: $GetSummonerMatchesType["matches"][number]["match_summoner"];
  i: number;
  count: number;
};

export const MatchListItem = ({ m, p, i, count }: Props) => {
  const metadata = useLoaderData({ from: "/lol" });

  return (
    <div key={m.matchId} className="flex items-center gap-3 font-mono p-2 border-dashed h-[60px]">
      <div className="shrink-0 w-1/12">
        <div className={cn("px-2 rounded-md bg-neutral-900 w-fit")}>{`${i}/${count}`}</div>
      </div>
      <div className="w-fit shrink-0">
        <div className={cn("px-2 rounded-md", p.win ? "bg-emerald-800" : "bg-red-800")}>
          {p.win ? "W" : "L"}
        </div>
      </div>

      {/* champion */}
      <div className="w-48 shrink-0 flex items-center gap-2.5">
        <img
          src={
            DDragonService.getChampionIconUrlFromParticipant(
              metadata.champions,
              metadata.latest_version,
              p,
            ) || "/placeholder.svg"
          }
          alt=""
          className="w-8 aspect-square rounded-md"
        />
        <div className="font-bold">
          <MatchItemChampionName championId={p.championId} />
        </div>
      </div>

      {/* KDA */}
      <div className="w-24 shrink-0 flex justify-center">
        <div className="flex gap-1">
          <span>{p.kills}</span>
          <span>/</span>
          <span>{p.assists}</span>
          <span>/</span>
          <span>{p.deaths}</span>
        </div>
      </div>

      {/* items, démarrent tous au même x */}
      <div className="flex-1 min-w-0 flex items-center gap-1">
        {p.items.map((i, idx) => (
          <div
            key={idx}
            style={{
              backgroundImage: `url(${DDragonService.getItemIconUrl(metadata.latest_version, i)})`,
            }}
            className={cn(
              "w-6 aspect-square rounded-md bg-cover",
              p.win ? "bg-emerald-800/20" : "bg-red-800/20",
            )}
          />
        ))}
      </div>

      <div className="text-right tabular-nums">{formatSeconds(m.gameDurationSec)}</div>
    </div>
  );
};
