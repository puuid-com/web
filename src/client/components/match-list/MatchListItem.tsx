import { MatchItemChampionName } from "@/client/components/match-list/MatchItemChampionName";
import { ChampionTooltip } from "@/client/components/tooltips/ChampionTooltip";
import { ItemTooltip } from "@/client/components/tooltips/ItemTooltip";
import { useMatchContext } from "@/client/context/MatchContext";
import { cn, formatSeconds } from "@/client/lib/utils";
import { DDragonService } from "@/shared/services/DDragon/DDragonService";
import { useLoaderData } from "@tanstack/react-router";

type Props = {};

export const MatchListItem = ({}: Props) => {
  const { match, matchSummoner, index, count } = useMatchContext();

  const metadata = useLoaderData({ from: "/lol" });

  return (
    <div
      key={match.matchId}
      className="flex items-center gap-3 font-mono p-2 border-dashed h-[60px]"
    >
      <div className="shrink-0 w-1/12">
        <div className={cn("px-2 rounded-md bg-neutral-900 w-fit")}>{`${index}/${count}`}</div>
      </div>
      <div className="w-fit shrink-0">
        <div className={cn("px-2 rounded-md", matchSummoner.win ? "bg-emerald-800" : "bg-red-800")}>
          {matchSummoner.win ? "W" : "L"}
        </div>
      </div>

      {/* champion */}
      <div className="w-48 shrink-0 flex items-center gap-2.5">
        <ChampionTooltip championId={matchSummoner.championId}>
          <img
            src={
              DDragonService.getChampionIconUrlFromParticipant(
                metadata.champions,
                metadata.latest_version,
                matchSummoner,
              ) || "/placeholder.svg"
            }
            alt=""
            className="w-8 aspect-square rounded-md"
          />
        </ChampionTooltip>
        <div className="font-bold">
          <MatchItemChampionName championId={matchSummoner.championId} />
        </div>
      </div>

      {/* KDA */}
      <div className="w-24 shrink-0 flex justify-center">
        <div className="flex gap-1">
          <span>{matchSummoner.kills}</span>
          <span>/</span>
          <span>{matchSummoner.assists}</span>
          <span>/</span>
          <span>{matchSummoner.deaths}</span>
        </div>
      </div>

      {/* items, démarrent tous au même x */}
      <div className="flex-1 min-w-0 flex items-center gap-1">
        {matchSummoner.items.map((itemId, idx) => (
          <ItemTooltip key={idx} itemId={itemId}>
            <div
              style={{
                backgroundImage: `url(${DDragonService.getItemIconUrl(metadata.latest_version, itemId)})`,
              }}
              className={cn(
                "w-6 aspect-square rounded-md bg-cover",
                matchSummoner.win ? "bg-emerald-800/20" : "bg-red-800/20",
              )}
            />
          </ItemTooltip>
        ))}
      </div>
      <div className="text-right tabular-nums">{formatSeconds(match.gameDurationSec)}</div>
    </div>
  );
};
