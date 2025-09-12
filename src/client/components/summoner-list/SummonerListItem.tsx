import { Badge } from "@/client/components/ui/badge";
import { DDragonService } from "@/shared/services/DDragon/DDragonService";
import type { $GetSummonersWithRelationsType } from "@/server/functions/$getSummonersWithRelations";
import { Link, useLoaderData } from "@tanstack/react-router";

type Props = {
  s: $GetSummonersWithRelationsType[number];
};

export const SummonerListItem = ({ s }: Props) => {
  const metadata = useLoaderData({ from: "__root__" });

  const soloDuoStats = s.statistics.find((s) => s.queueType === "RANKED_SOLO_5x5");
  const bgColor = soloDuoStats?.mainChampionBackgroundColor;
  const textColor = soloDuoStats?.mainChampionForegroundColor;

  const soloLeague = s.leagues.find((l) => l.queueType === "RANKED_SOLO_5x5");

  return (
    <Link
      className={"bg-main/30 hover:bg-main/50 p-2.5 rounded-md h-[80px] flex items-center"}
      key={`default-link-${s.puuid}`}
      to={"/lol/summoner/$riotID"}
      params={{ riotID: s.riotId.replace("#", "-") }}
      search={{
        queue: "RANKED_SOLO_5x5",
      }}
      style={
        {
          "--color-main": bgColor ?? undefined,
          "--color-main-foreground": textColor ?? undefined,
        } as React.CSSProperties
      }
    >
      <div className={"flex gap-1.5 items-center w-full"}>
        <div
          className={"w-15 aspect-square rounded-md relative bg-cover"}
          style={{
            backgroundImage: `url(${DDragonService.getProfileIconUrl(
              metadata.latest_version,
              s.profileIconId,
            )})`,
          }}
        >
          <Badge
            className={
              "bg-main/70 text-main-foreground text-xs p-0 px-1 absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2"
            }
          >
            {s.summonerLevel}
          </Badge>
        </div>
        <div className={"flex flex-col gap-0.5"}>
          <div className={"flex gap-1 items-center"}>
            <div>{s.displayRiotId}</div>
            <Badge
              className={
                "px-1 h-5 text-xs font-mono tabular-nums bg-main/80 font-bold text-main-foreground"
              }
            >
              {s.region}
            </Badge>
          </div>
          {soloDuoStats ? (
            <Badge className={"px-1"}>
              <img
                className={"w-4 rounded-md"}
                src={DDragonService.getChampionIconUrlFromParticipant(
                  metadata.champions,
                  metadata.latest_version,
                  { championId: soloDuoStats.mainChampionId },
                )}
                alt=""
              />
              <div>
                <span className={"font-bold"}>
                  {DDragonService.getChampionName(
                    metadata.champions,
                    soloDuoStats.mainChampionId,
                  )}{" "}
                </span>
                main
              </div>
            </Badge>
          ) : null}
        </div>
        {soloLeague ? (
          <div className={"flex ml-auto flex-col gap-0.5 justify-center items-end"}>
            <div>{`${soloLeague.tier} ${soloLeague.rank} — ${soloLeague.leaguePoints}LP`}</div>
            <div>{`${soloLeague.wins + soloLeague.losses} matches — ${((100 * soloLeague.wins) / (soloLeague.wins + soloLeague.losses)).toFixed(0)}%`}</div>
          </div>
        ) : null}
      </div>
    </Link>
  );
};
