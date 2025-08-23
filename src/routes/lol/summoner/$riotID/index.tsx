import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { DDragonService } from "@/client/services/DDragon";
import { MatchList } from "@/client/components/match-list/MatchList";
import { PositionIcon } from "@/client/components/PositionIcon";
import { SummonerNeverFetchedNotice } from "@/client/components/summoner/NoRefreshPage";

export const Route = createFileRoute("/lol/summoner/$riotID/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { summoner, stats } = useLoaderData({ from: "/lol/summoner/$riotID" });
  const { queue } = Route.useSearch();

  const metadata = useLoaderData({ from: "/lol" });

  if (!stats) {
    return (
      <div>
        <SummonerNeverFetchedNotice summoner={summoner} queue={queue} />
      </div>
    );
  }

  return (
    <div className={"flex gap-10"}>
      <div className={"flex flex-col gap-10 w-50"}>
        <div
          className={
            "flex flex-col bg-neutral-900 border rounded-md justify-center divide-y-1"
          }
        >
          <div
            className={
              "px-3 py-2 font-bold text-center bg-main/30 rounded-t-md"
            }
          >
            Stats by Champion
          </div>
          {stats?.statsByChampionId.map((s) => {
            const championName = DDragonService.getChampionName(
              metadata.champions,
              s.championId
            );
            const championUrl =
              DDragonService.getChampionIconUrlFromParticipant(
                metadata.champions,
                metadata.latest_version,
                s
              );

            return (
              <div
                key={`statsByChampionId-#${s.championId}`}
                className={
                  "flex gap-2.5 items-center justify-between px-2 py-1"
                }
              >
                <div className={"flex gap-1 items-center"}>
                  <img
                    className={"w-8 rounded-full"}
                    src={championUrl}
                    alt={`${championName} profil icon`}
                  />
                  <div>{championName}</div>
                </div>
                <div className={"leading-none"}>
                  <div
                    className={"text-xs"}
                  >{`${((s.wins / (s.wins + s.losses)) * 100).toFixed(0)}%`}</div>
                  <div className={"text-xs text-neutral-400"}>
                    {s.wins + s.losses} matches
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div
          className={
            "flex flex-col bg-neutral-900 border rounded-md justify-center divide-y-1"
          }
        >
          <div
            className={
              "px-3 py-2 font-bold text-center bg-main/30 rounded-t-md"
            }
          >
            Stats by Position
          </div>
          {stats?.statsByIndividualPosition.map((p) => {
            return (
              <div
                key={`statsByIndividualPosition-#${p.individualPosition}`}
                className={
                  "flex gap-2.5 items-center justify-between px-2 py-1"
                }
              >
                <div className={"flex gap-1 items-center"}>
                  <PositionIcon individualPosition={p.individualPosition} />
                  <div>{p.individualPosition}</div>
                </div>
                <div className={"leading-none"}>
                  <div
                    className={"text-xs"}
                  >{`${((p.wins / (p.wins + p.losses)) * 100).toFixed(0)}%`}</div>
                  <div className={"text-xs text-neutral-400"}>
                    {p.wins + p.losses} matches
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div
          className={
            "flex flex-col bg-neutral-900 border rounded-md justify-center divide-y-1"
          }
        >
          <div
            className={
              "px-3 py-2 font-bold text-center bg-main/30 rounded-t-md"
            }
          >
            Stats by Oponent Champion
          </div>
          {stats?.statsByOppositeIndividualPositionChampionId.map((s) => {
            const championName = DDragonService.getChampionName(
              metadata.champions,
              s.championId
            );
            const championUrl =
              DDragonService.getChampionIconUrlFromParticipant(
                metadata.champions,
                metadata.latest_version,
                s
              );

            return (
              <div
                key={`statsByOppositeIndividualPositionChampionId-#${s.championId}`}
                className={
                  "flex gap-2.5 items-center justify-between px-2 py-1"
                }
              >
                <div className={"flex gap-1 items-center"}>
                  <img
                    className={"w-8 rounded-full"}
                    src={championUrl}
                    alt={`${championName} profil icon`}
                  />
                  <div>{championName}</div>
                </div>
                <div className={"leading-none"}>
                  <div
                    className={"text-xs"}
                  >{`${((s.wins / (s.wins + s.losses)) * 100).toFixed(0)}%`}</div>
                  <div className={"text-xs text-neutral-400"}>
                    {s.wins + s.losses} matches
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className={"flex flex-1"}>
        <MatchList summoner={summoner} queue={queue} />
      </div>
    </div>
  );
}
