import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/client/components/ui/avatar";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/client/components/ui/card";
import { CDragonService } from "@puuid/core/shared/services/CDragonService";
import { Link, useLoaderData } from "@tanstack/react-router";
import { BrainIcon, ChevronRightIcon, GlobeIcon, LockIcon, RatIcon } from "lucide-react";

type Props = {};

export const UserPageSummoners = ({}: Props) => {
  const { page, isOwner } = useLoaderData({ from: "/page/$name" });

  const pageSummoners = page.summoners;

  const orderedSummoners = useMemo(() => {
    const priority: Record<"MAIN" | "SMURF", number> = {
      MAIN: 0,
      SMURF: 1,
    };

    return [...pageSummoners].sort((a, b) => {
      const typeDiff = priority[a.type] - priority[b.type];
      if (typeDiff !== 0) return typeDiff;

      return a.summoner.displayRiotId.localeCompare(b.summoner.displayRiotId);
    });
  }, [pageSummoners]);

  return (
    <Card>
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          Summoners
          <Badge variant="outline" className="text-[11px]">
            {pageSummoners.length}
          </Badge>
        </CardTitle>
        {isOwner ? (
          <CardAction>
            <Button asChild size="xs" variant="outline">
              <Link to="/user/settings">Manage</Link>
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="pb-5 max-h-100 overflow-auto">
        {orderedSummoners.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-800/70 bg-neutral-900/50 py-8 text-center text-sm text-neutral-400">
            No summoners linked yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {orderedSummoners.map(({ summoner, type, isPublic }) => {
              const [gameName = summoner.displayRiotId, tagLine] =
                summoner.displayRiotId.split("#");

              return (
                <li key={summoner.puuid}>
                  <Link
                    to={"/lol/summoner/$riotID/matches"}
                    params={{ riotID: summoner.riotId.replace("#", "-") }}
                    search={{ q: "solo", p: 1 }}
                    target="_blank"
                    className="group flex items-center gap-3 rounded-lg border border-neutral-800/70 bg-neutral-900/40 p-3 transition-colors hover:border-main/70 hover:bg-neutral-900/70"
                  >
                    <Avatar className="h-10 w-10 border border-neutral-800">
                      <AvatarImage
                        src={CDragonService.getProfileIcon(summoner.profileIconId)}
                        alt={`${gameName} profile icon`}
                      />
                      <AvatarFallback>{gameName.slice(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-baseline gap-2">
                        <span className="truncate text-sm font-medium text-neutral-100">
                          {gameName}
                        </span>
                        {tagLine ? (
                          <span className="text-xs text-neutral-400">#{tagLine}</span>
                        ) : null}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-300">
                        <Badge variant="outline" className="gap-1">
                          {type === "MAIN" ? (
                            <>
                              <BrainIcon className="h-3 w-3" /> Main
                            </>
                          ) : (
                            <>
                              <RatIcon className="h-3 w-3" /> Smurf
                            </>
                          )}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          {isPublic ? (
                            <>
                              <GlobeIcon className="h-3 w-3" /> Public
                            </>
                          ) : (
                            <>
                              <LockIcon className="h-3 w-3" /> Private
                            </>
                          )}
                        </Badge>
                        <span className="text-[11px] text-neutral-500">
                          {summoner.refreshes.length ? null : "Not refreshed yet"}
                        </span>
                      </div>
                    </div>

                    <ChevronRightIcon className="h-4 w-4 text-neutral-500 transition-colors group-hover:text-neutral-300" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
