import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/client/components/ui/card";
import { timeago } from "@/client/lib/utils";
import { authClient } from "@/lib/auth-client";
import { CDragonService } from "@puuid/core/shared/services/CDragonService";
import { DDragonService } from "@puuid/core/shared/services/DDragonService";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import {
  BrainIcon,
  ExternalLink,
  RatIcon,
  RefreshCwIcon,
  RefreshCwOffIcon,
  UserPlus,
} from "lucide-react";

export const Route = createFileRoute("/user/accounts")({
  component: AccountsPage,
});

function AccountsPage() {
  const { champions } = useLoaderData({ from: "__root__" });

  const { summoners } = Route.useRouteContext();
  const route = Route.useMatch();

  const handleLinkAccount = async () => {
    await authClient.oauth2.link({ providerId: "riot-games", callbackURL: route.fullPath });
  };

  return (
    <div className="">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Linked Accounts</CardTitle>
            <Button onClick={() => void handleLinkAccount()} variant="secondary">
              <img
                src={"https://cdn.puuid.com/public/image/icon/riot-games-red-round.png"}
                alt=""
                className="w-5 rounded-md"
              />
              Link account
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {summoners.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No accounts linked</h3>
              <p className="text-muted-foreground mb-4">
                Connect your League of Legends accounts to get started
              </p>
              <Button onClick={() => void handleLinkAccount()} variant="secondary">
                Link account
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {summoners.map(({ summoner, type }) => {
                const [gameName, tagLine] = summoner.displayRiotId.split("#");

                const mainStats = summoner.statistics.at(0);

                const backgroundColor = mainStats?.mainChampionBackgroundColor;
                const foregroundColor = mainStats?.mainChampionForegroundColor;

                return (
                  <div
                    key={summoner.puuid}
                    className="bg-cover flex items-center justify-between gap-4 rounded-md border p-3 bg-main/10 ring ring-main"
                    style={
                      {
                        "--color-main": backgroundColor ?? undefined,
                        "--color-main-foreground": foregroundColor ?? undefined,
                        backgroundBlendMode: "overlay",
                      } as React.CSSProperties
                    }
                  >
                    <div className="flex items-center gap-3">
                      <img
                        className="w-12 h-12 rounded-md border"
                        src={CDragonService.getProfileIcon(summoner.profileIconId)}
                        alt="profile icon"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{gameName}</h3>
                          <span className="text-muted-foreground">#{tagLine}</span>
                          <Badge variant="secondary" className="text-xs">
                            Lv. {summoner.summonerLevel}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="gap-1">
                            {type === "MAIN" ? (
                              <>
                                <BrainIcon className="w-3 h-3" /> Main
                              </>
                            ) : (
                              <>
                                <RatIcon className="w-3 h-3" /> Smurf
                              </>
                            )}
                          </Badge>
                          {mainStats ? (
                            <Badge variant={"main"}>
                              <img
                                src={CDragonService.getChampionSquare(mainStats.mainChampionId)}
                                alt={`${DDragonService.getChampionName(champions, mainStats.mainChampionId)} icon`}
                                className={"w-3 rounded-md"}
                              />
                              {DDragonService.getChampionName(champions, mainStats.mainChampionId)}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          to={"/lol/summoner/$riotID/matches"}
                          params={{ riotID: summoner.riotId.replace("#", "-") }}
                          search={{ q: "solo" }}
                          target="_blank"
                        >
                          <ExternalLink className="w-4 h-4" /> Go to page
                        </Link>
                      </Button>
                      <Badge variant="outline" className="gap-1">
                        {summoner.refresh?.refreshedAt ? (
                          <>
                            <RefreshCwIcon className="w-3 h-3" /> Refreshed{" "}
                            {timeago(summoner.refresh.refreshedAt)} ago
                          </>
                        ) : (
                          <>
                            <RefreshCwOffIcon className="w-3 h-3" /> Not refreshed yet
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
