import { Avatar, AvatarFallback, AvatarImage } from "@/client/components/ui/avatar";
import { Badge } from "@/client/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/client/components/ui/card";
import { timeago } from "@/client/lib/utils";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import { Link, useLoaderData } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";

type Props = {};

export const UserPageSummoners = ({}: Props) => {
  const { page } = useLoaderData({ from: "/page/$name" });

  const pageSummoners = page.summoners;

  return (
    <Card className="">
      <CardHeader className="">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-neutral-200">Summoners</CardTitle>
          <Badge variant="outline" className="text-xs">
            {pageSummoners.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="">
        {pageSummoners.length === 0 ? (
          <div className="text-sm text-neutral-400">No summoners linked.</div>
        ) : (
          <div className="space-y-1">
            {pageSummoners.map(({ summoner, type, isPublic }) => {
              const riotId = summoner.displayRiotId;
              const [gameNameRaw, tagLine = ""] = riotId.includes("#")
                ? riotId.split("#")
                : [riotId, ""];
              const gameName = gameNameRaw ?? riotId;
              const mainStats = summoner.statistics.at(0);
              const backgroundColor = mainStats?.mainChampionBackgroundColor;
              const foregroundColor = mainStats?.mainChampionForegroundColor;

              return (
                <Link
                  key={summoner.puuid}
                  to={"/lol/summoner/$riotID/matches"}
                  params={{ riotID: summoner.riotId.replace("#", "-") }}
                  search={{ q: "solo" }}
                  target="_blank"
                  className="group flex items-center justify-between gap-3 rounded-md border border-neutral-800/80 bg-neutral-900/50 p-3 hover:bg-neutral-800/60 transition-colors"
                  style={
                    {
                      "--color-main": backgroundColor ?? undefined,
                      "--color-main-foreground": foregroundColor ?? undefined,
                    } as React.CSSProperties
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={CDragonService.getProfileIcon(summoner.profileIconId)}
                        alt="profile icon"
                      />
                      <AvatarFallback>{(gameName || "?").slice(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-sm font-medium text-neutral-100 truncate">
                          {gameName}
                        </h3>
                        <span className="text-xs text-neutral-400 shrink-0">#{tagLine}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-neutral-300">
                        <Badge variant="outline" className="gap-1">
                          {type}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          {isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-[10px] text-neutral-400 hidden sm:block">
                      {summoner.refresh?.refreshedAt ? (
                        <span>Refreshed {timeago(summoner.refresh.refreshedAt)} ago</span>
                      ) : (
                        <span>Not refreshed yet</span>
                      )}
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
