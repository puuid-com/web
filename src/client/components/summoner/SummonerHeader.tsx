import { Badge } from "@/client/components/ui/badge";
import { timeago } from "@/client/lib/utils";
import { DDragonService } from "@/client/services/DDragon";
import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";
import type { SummonerType } from "@/server/db/schema";
import { Link, useLoaderData } from "@tanstack/react-router";

type Props = {
  summoner: SummonerType;
  queue: LolQueueType;
};

export const SummonerHeader = ({ summoner, queue }: Props) => {
  const metadata = useLoaderData({ from: "/lol" });

  const [gameName, tagLine] = summoner.riotId.split("#");

  return (
    <div>
      <div>
        <div className={"flex items-center gap-2"}>
          <div>
            <img
              src={DDragonService.getProfileIconUrl(
                metadata.latest_version,
                summoner.profileIconId
              )}
              alt=""
              className={"w-16 aspect-square"}
            />
          </div>
          <div>
            <h1 className={"text-3xl"}>
              <span>{gameName}</span>
              <span className={"text-muted italic"}>#{tagLine}</span>
            </h1>
            <div>
              <Link
                to={"/lol/summoner/$riotID/refresh"}
                params={{
                  riotID: summoner.riotId,
                }}
                search={{
                  queue: queue,
                }}
              >
                Refresh Summoner
              </Link>
              <Badge variant={"secondary"}>
                Last refresh : {timeago(summoner.refreshedAt)}
              </Badge>
            </div>
          </div>
        </div>
        <div className={"font-mono bg-neutral-700 rounded-md px-1"}>
          {summoner.puuid}
        </div>
      </div>
      <div className={"flex flex-col justify-center items-start"}>
        <div className={"bg-purple-500 rounded-md p-0.5"}>
          {summoner.region}
        </div>
      </div>
    </div>
  );
};
