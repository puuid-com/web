import { LiveSummonerStats } from "@/client/components/summoner/live/summoner/LiveSummonerStats";
import { cn } from "@/client/lib/utils";
import type { LeagueRowType } from "@/server/db/schema/league";
import type { $GetSummonerActiveMatchType } from "@/server/functions/$getSummonerActiveMatch";
import { CDNService } from "@/shared/services/CDNService";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import { DDragonService } from "@/shared/services/DDragon/DDragonService";
import { Link, useLoaderData } from "@tanstack/react-router";

type Props = {
  side: "red" | "blue"; // conservé si tu en as besoin ailleurs, non utilisé ici
  participant: NonNullable<$GetSummonerActiveMatchType>["participants"][number];
  isSelf: boolean;
  league?: LeagueRowType;
};

export function SummonerLiveTeamSummoner({ /* side, */ isSelf, league, participant }: Props) {
  const metadata = useLoaderData({ from: "__root__" });

  const championName = metadata.champions[participant.championId]!.name;
  const championImageUrl = CDragonService.getChampionSquare(participant.championId);
  const displayRiotId = participant.summoner.displayRiotId;
  const summonerIconUrl = CDragonService.getProfileIcon(participant.summoner.profileIconId);

  const winrate =
    league && league.wins + league.losses > 0
      ? Math.round((league.wins / (league.wins + league.losses)) * 100)
      : undefined;

  const stats = participant.stats;

  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 justify-between",
        "group-last:flex-row-reverse group-last:text-right group-first:text-left",
        "bg-background/60",
        "ring-1 ring-border/60",
        isSelf && "ring-2 ring-main/70 bg-main/5",
      )}
    >
      <div className="">
        <div className="relative rounded-md overflow-hidden flex gap-2.5 group-last:flex-row-reverse">
          <img
            src={championImageUrl}
            alt={championName}
            className="h-full w-20"
            loading="eager"
            decoding="async"
          />
          <div className={"flex flex-col gap-2.5 justify-center"}>
            <img
              src={DDragonService.getSummonerSpellIconUrl(
                metadata.summoner_spells,
                metadata.latest_version,
                participant.spell1Id,
              )}
              alt=""
              className={"w-6 aspect-square rounded-md"}
            />
            <img
              src={DDragonService.getSummonerSpellIconUrl(
                metadata.summoner_spells,
                metadata.latest_version,
                participant.spell2Id,
              )}
              alt=""
              className={"w-6 aspect-square rounded-md"}
            />
          </div>
        </div>
      </div>

      {/* bloc texte au centre */}
      <div className="min-w-0 flex-1">
        <div className={cn("font-medium leading-tight truncate")} title={championName}>
          {championName}
        </div>

        {/* lien joueur distinct avec avatar, orientation miroir par colonne */}
        <Link
          to={"/lol/summoner/$riotID/matches"}
          params={{ riotID: displayRiotId }}
          search={{ q: "solo" }}
          target={"_blank"}
          className={cn(
            "mt-1 inline-flex items-center gap-2 rounded-md px-2 py-1",
            "ring-1 ring-border/70 hover:bg-accent/60 transition-colors",
            "text-sm font-medium",
            "group-last:flex-row-reverse group-first:flex-row",
          )}
          title={`Voir les matchs de ${displayRiotId}`}
        >
          <img
            src={summonerIconUrl}
            alt={`${displayRiotId} icon`}
            className="size-4 rounded"
            loading="lazy"
            decoding="async"
          />
          <span className="truncate text-tiny">{displayRiotId}</span>
        </Link>
        {league ? (
          <div className={"flex gap-1 items-center group-last:flex-row-reverse"}>
            <div className="text-sm text-muted-foreground">
              {winrate !== undefined ? `${winrate}%` : "—"}
            </div>
            <div className="text-tiny text-muted-foreground">
              {`${(league.wins + league.losses).toLocaleString()} matches`}
            </div>
          </div>
        ) : null}
      </div>

      {stats ? <LiveSummonerStats stats={stats} /> : null}

      {/* bloc rang, toujours dernier dans le DOM, donc au bord externe */}
      <div className="flex items-center gap-3">
        {league ? (
          <div className={cn("flex items-center gap-3", "group-last:flex-row-reverse")}>
            <div className={cn("group-last:text-left group-first:text-right")}></div>
            <div className="text-center">
              <img
                src={CDNService.getTierImageUrl(league.tier)}
                alt={`${league.tier} badge`}
                className="w-10 sm:w-12 h-auto mx-auto drop-shadow"
                loading="eager"
                decoding="async"
              />
              <div className="text-xs sm:text-sm mt-1">{league.tier}</div>
              <div className="text-xs sm:text-sm mt-1">{`${league.rank} ${league.leaguePoints}LP`}</div>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-xs sm:text-sm opacity-80">Unranked</div>
        )}
      </div>
    </div>
  );
}
