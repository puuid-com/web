import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { cn, timeago } from "@/client/lib/utils";
import { DDragonService } from "@/client/services/DDragon";
import { Link, useParams, useLoaderData, useSearch } from "@tanstack/react-router";
import { Clock3 } from "lucide-react";

type Props = {};

export const SummonerHeader = ({}: Props) => {
  const metadata = useLoaderData({ from: "/lol" });
  const params = useParams({ from: "/lol/summoner/$riotID" });
  const search = useSearch({ from: "/lol/summoner/$riotID" });
  const { summoner, queueStats: stats } = useLoaderData({
    from: "/lol/summoner/$riotID",
  });

  const [gameName, tagLine] = summoner.riotId.split("#");

  return (
    <div className={"rounded-bl-3xl flex bg-main/30 relative overflow-hidden justify-between"}>
      {stats?.mainChampionId ? (
        <>
          <img
            src={DDragonService.getChampionLoadingScreenImage(
              metadata.champions,
              stats.mainChampionId,
            )}
            className="absolute right-0 mask-l-from-0% opacity-30"
          />
        </>
      ) : null}
      <div className={cn("flex flex-col h-full justify-start")}>
        <div className={"flex gap-2.5"}>
          <div
            className="m-3.5 relative object-cover bg-cover w-24 aspect-square rounded-md"
            style={{
              backgroundImage: `url(${DDragonService.getProfileIconUrl(
                metadata.latest_version,
                summoner.profileIconId,
              )})`,
            }}
          >
            <div className={"absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2"}>
              <Badge variant={"secondary"} className={"border-main/ bg-main/70"}>
                {summoner.summonerLevel}
              </Badge>
            </div>
          </div>
          <div className={cn("flex flex-col justify-center gap-1.5")}>
            <div className={"flex flex-col"}>
              <div className={"flex gap-2.5 items-center"}>
                <Link to={"/lol/summoner/$riotID"} params={params} search={search}>
                  <h1 className={cn("transition-all duration-300 ease-out")}>
                    <span className={"font-bold"}>{gameName}</span>
                    <span className={"text-neutral-500"}>#{tagLine}</span>
                  </h1>
                </Link>
              </div>
              <div className="">
                <Button size={"xs"} asChild>
                  <Link to={"/lol/summoner/$riotID/refresh"} params={params} search={search}>
                    <Clock3 />
                    Refreshed <span className={"font-bold"}>
                      {timeago(summoner.refreshedAt)}
                    </span>{" "}
                    ago
                  </Link>
                </Button>
              </div>
            </div>
            {stats ? (
              <div className="text-xs">
                <div>Main Position : {stats.mainIndividualPosition}</div>
                <div>
                  Main Champion:{" "}
                  {DDragonService.getChampionName(metadata.champions, stats.mainChampionId)}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
