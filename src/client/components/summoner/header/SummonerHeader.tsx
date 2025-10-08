import { RefreshSummoner } from "@/client/components/refresh/RefreshSummoner";
import { SummonerHeaderInfo } from "@/client/components/summoner/header/SummonerHeaderInfo";
import { SummonerSkinDialog } from "@/client/components/summoner/header/SummonerSkinDialog";
import { Badge } from "@/client/components/ui/badge";
import { cn, timeago } from "@/client/lib/utils";
import { CDragonService } from "@puuid/core/shared/services/CDragonService";
import { DDragonService } from "@puuid/core/shared/services/DDragonService";
import { Link, useParams, useLoaderData, useSearch } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import type React from "react";

type Props = {
  className?: React.ComponentProps<"div">["className"];
};

export const SummonerHeader = ({ className }: Props) => {
  const metadata = useLoaderData({ from: "__root__" });

  const params = useParams({ from: "/lol/summoner/$riotID" });
  const search = useSearch({ from: "/lol/summoner/$riotID" });
  const { summoner, queueStats: stats } = useLoaderData({
    from: "/lol/summoner/$riotID",
  });
  const [gameName, tagLine] = summoner.displayRiotId.split("#");

  const mainStats = stats?.summonerStatistic;
  const mainChampionId = summoner.mainChampionId;
  const skinId = summoner.mainChampionSkinId;

  return (
    <div
      className={cn(
        "rounded-b-3xl flex bg-main/10 relative justify-between bg-cover bg-blend-exclusion bg-no-repeat bg-[position:50%_-200px]",
        className,
      )}
      style={{
        backgroundImage: mainChampionId
          ? `url(${CDragonService.getChampionSplashArtCenteredSkin(mainChampionId, skinId ?? 0)})`
          : undefined,
      }}
    >
      <div className={"absolute top-0 right-0 m-1.5 flex gap-1.5 items-center"}>
        {mainChampionId ? (
          <>
            <SummonerSkinDialog />
            <SummonerHeaderInfo />
          </>
        ) : null}
      </div>
      <div className={cn("flex flex-col h-full justify-start")}>
        <div className={"flex gap-2.5"}>
          <div
            className="m-5 relative object-cover bg-cover w-24 aspect-square rounded-md"
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
                  <h1 className={"text-2xl flex gap-0.5 items-center"}>
                    <span className={"font-bold"}>{gameName}</span>
                    <span className={"text-main/90 text-base"}>#{tagLine}</span>
                  </h1>
                </Link>
              </div>
              <div className="">
                <RefreshSummoner key={summoner.puuid}>
                  <>
                    <RefreshCw />
                    {stats?.refreshedAt ? (
                      `Refreshed ${timeago(stats.refreshedAt)} ago`
                    ) : (
                      <span className={"font-bold"}>Refresh</span>
                    )}
                  </>
                </RefreshSummoner>
              </div>
            </div>
            {mainStats ? (
              <div className="flex gap-2.5 text-sm">
                <div>
                  Main Position: <Badge variant={"main"}>{mainStats.mainPosition}</Badge>
                </div>
                <div>
                  Main Champion:{" "}
                  <Badge variant={"main"}>
                    {DDragonService.getChampionName(metadata.champions, mainStats.mainChampionId)}
                  </Badge>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
