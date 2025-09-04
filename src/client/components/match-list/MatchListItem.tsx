import { MatchItemChampionName } from "@/client/components/match-list/MatchItemChampionName";
import { POSITION_INDEXES } from "@/client/components/summoner/live/utils";
import { ChampionTooltip } from "@/client/components/tooltips/ChampionTooltip";
import { ItemTooltip } from "@/client/components/tooltips/ItemTooltip";
import { Badge } from "@/client/components/ui/badge";
import { useMatchContext } from "@/client/context/MatchContext";
import { cn, formatSeconds } from "@/client/lib/utils";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import { DDragonService } from "@/shared/services/DDragon/DDragonService";
import { useLoaderData } from "@tanstack/react-router";

type Props = {};

export const MatchListItem = ({}: Props) => {
  const { match, matchSummoner, index, count } = useMatchContext();

  const metadata = useLoaderData({ from: "/lol" });

  return (
    <div
      key={match.matchId}
      className="flex items-center gap-3 font-mono p-2 border-dashed h-[80px] bg-gradient-to-r from-neutral-900/20 to-match/10"
    >
      <div className="shrink-0 w-1/12 flex flex-col items-center justify-center gap-1">
        <div className={cn("px-2 rounded-md bg-match w-fit")}>{`${index}/${count}`}</div>
      </div>

      {/* champion */}
      <div className="w-48 shrink-0 flex items-center gap-2.5">
        <ChampionTooltip championId={matchSummoner.championId}>
          <div
            style={{
              backgroundImage: `url(${CDragonService.getChampionSquare(matchSummoner.championId)})`,
              backgroundSize: "115%",
            }}
            className={"w-12 aspect-square bg-cover bg-center rounded-lg"}
          />
        </ChampionTooltip>
        <div className="font-bold">
          <MatchItemChampionName championId={matchSummoner.championId} />
          <div>
            <Badge variant={"main"}>{matchSummoner.individualPosition}</Badge>
          </div>
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
      <div className="grid grid-cols-3 grid-rows-2">
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
      <div className={"grid grid-cols-2 grid-rows-5 gap-x-1 ml-auto"}>
        {match.summoners
          .sort((a, b) => {
            return POSITION_INDEXES[a.individualPosition] - POSITION_INDEXES[b.individualPosition];
          })
          .map((s) => {
            const championIconUrl = CDragonService.getChampionTile(s.championId);
            return (
              <div className={"flex gap-0.5"} key={`MatchListItem-summoner-#${s.puuid}`}>
                <div>
                  <img src={championIconUrl} alt="" className={"w-3 rounded-md"} />
                </div>
                <div
                  className={[
                    "text-tiny truncate text-ellipsis flex",
                    s.puuid === matchSummoner.puuid ? "text-main" : "",
                  ].join(" ")}
                >
                  <div className={""}>{s.gameName}</div>
                  <div className={"text-muted-foreground text-tiny"}>{`#${s.tagLine}`}</div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
