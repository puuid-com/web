import { RiotIdForm } from "@/client/components/riot-id-form/RiotIdForm";
import { Badge } from "@/client/components/ui/badge";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { DDragonService } from "@/client/services/DDragon";
import { $getSummoners } from "@/server/functions/$getSummoners";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute("/lol/summoner/")({
  component: RouteComponent,
  loader: async () => await $getSummoners(),
});

function RouteComponent() {
  const summoners = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const metadata = useLoaderData({ from: "/lol" });

  const handleNavigateToSummer = (riotID: string) => {
    navigate({
      to: "/lol/summoner/$riotID",
      params: {
        riotID: riotID,
      },
      search: {
        queue: "RANKED_SOLO_5x5",
      },
    });
  };

  return (
    <div className={"flex container mx-auto flex-col"}>
      <div className={"flex gap-2 p-5 items-center justify-center"}>
        <RiotIdForm onSuccess={handleNavigateToSummer} />
      </div>
      <div className={"flex gap-2.5 flex-col"}>
        {summoners.map((s) => {
          const soloDuoStats = s.statistics.find(
            (s) => s.queueType === "RANKED_SOLO_5x5"
          );
          const bgColor = soloDuoStats?.mainChampionBackgroundColor;
          const textColor = soloDuoStats?.mainChampionForegroundColor;

          const soloLeague = s.leagues.find(
            (l) => l.queueType === "RANKED_SOLO_5x5"
          );

          return (
            <Link
              className={"bg-main/25 p-2.5 rounded-md"}
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
              <div className={"flex gap-1.5 items-center"}>
                <div
                  className={"w-15 aspect-square rounded-md relative bg-cover"}
                  style={{
                    backgroundImage: `url(${DDragonService.getProfileIconUrl(
                      metadata.latest_version,
                      s.profileIconId
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
                    <div>{s.riotId}</div>
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
                          { championId: soloDuoStats.mainChampionId }
                        )}
                        alt=""
                      />
                      <div>
                        <span className={"font-bold"}>
                          {DDragonService.getChampionName(
                            metadata.champions,
                            soloDuoStats.mainChampionId
                          )}{" "}
                        </span>
                        main
                      </div>
                    </Badge>
                  ) : null}
                </div>
                {soloLeague ? (
                  <div
                    className={
                      "flex ml-auto flex-col gap-0.5 justify-center items-end"
                    }
                  >
                    <div>{`${soloLeague.tier} ${soloLeague.rank} — ${soloLeague.leaguePoints}LP`}</div>
                    <div>{`${soloLeague.wins + soloLeague.losses} matches — ${((100 * soloLeague.wins) / (soloLeague.wins + soloLeague.losses)).toFixed(0)}%`}</div>
                  </div>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
