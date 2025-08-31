import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/client/components/ui/card";
import { cn, timeago } from "@/client/lib/utils";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  BrainIcon,
  ExternalLink,
  RatIcon,
  RefreshCwIcon,
  RefreshCwOffIcon,
  Trophy,
  UserPlus,
} from "lucide-react";
import React from "react";
import riotGamesIcon from "./riot-games-red-round.png";
import { UserUpdateForm } from "@/client/components/user/UserUpdateForm";

export const Route = createFileRoute("/user/")({
  component: RouteComponent,
  beforeLoad: (ctx) => {
    const context = ctx.context;

    if (!context.user) {
      throw redirect({
        to: "/",
      });
    }

    return {
      user: context.user,
      summoners: context.summoners,
      mainSummoner: context.mainSummoner,
      otherSummoners: context.otherSummoners,
    };
  },
});

function RouteComponent() {
  const { summoners } = Route.useRouteContext();
  const route = Route.useMatch();

  const handleLinkAccount = async () => {
    await authClient.oauth2.link({
      providerId: "riot-games",
      callbackURL: route.fullPath,
    });
  };

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <UserUpdateForm />
          <Card className="bg-card border-border mt-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-card-foreground flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-primary" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{summoners.length}</p>
                  <p className="text-sm text-muted-foreground">Accounts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {summoners.reduce((acc, s) => acc + s.summonerLevel, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Levels</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-card-foreground">
                  League of Legends Accounts
                </CardTitle>
                <Badge variant="outline" className="text-muted-foreground">
                  {summoners.length} Linked
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summoners.map((summoner) => {
                  const [gameName, tagLine] = summoner.displayRiotId.split("#");
                  const stats = summoner.statistics.find((s) => s.queueType === "RANKED_SOLO_5x5");

                  const bgColor = stats?.mainChampionBackgroundColor;
                  const textColor = stats?.mainChampionForegroundColor;

                  return (
                    <div
                      key={summoner.puuid}
                      style={
                        {
                          "--color-main": bgColor ?? undefined,
                          "--color-main-foreground": textColor ?? undefined,
                        } as React.CSSProperties
                      }
                    >
                      <div className="flex items-center justify-between p-4 rounded-lg border border-border transition-colors bg-main/30">
                        <div className="flex items-center space-x-4">
                          <img
                            className={cn(
                              "w-16 aspect-square rounded-md border-3",
                              bgColor ? "border-main/50" : "border-neutral-950/50",
                            )}
                            src={CDragonService.getProfileIcon(summoner.profileIconId)}
                            alt={`${summoner.riotId} profile icon`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-card-foreground">{gameName}</h3>
                              <span className="text-muted-foreground">#{tagLine}</span>
                              <Badge variant="secondary" className="text-xs">
                                Level {summoner.summonerLevel}
                              </Badge>
                            </div>
                            <div>
                              <Badge
                                variant={summoner.isMain ? "secondary" : "outline"}
                                className={"bg-main"}
                              >
                                {summoner.isMain ? (
                                  <React.Fragment>
                                    <BrainIcon />
                                    Main
                                  </React.Fragment>
                                ) : (
                                  <React.Fragment>
                                    <RatIcon />
                                    Smurf
                                  </React.Fragment>
                                )}
                              </Badge>
                            </div>

                            {/* {summoner.tier && summoner.rank && (
                              <div className="flex items-center space-x-3 text-sm">
                                <Badge
                                  variant="outline"
                                  className={
                                    summoner.tier === "GOLD"
                                      ? "border-yellow-500 text-yellow-600"
                                      : summoner.tier === "SILVER"
                                        ? "border-gray-400 text-gray-500"
                                        : ""
                                  }
                                >
                                  {summoner.tier} {summoner.rank}
                                </Badge>
                                <span className="text-muted-foreground">
                                  {summoner.leaguePoints} LP
                                </span>
                                <span className="text-muted-foreground">
                                  {summoner.wins}W {summoner.losses}L
                                </span>
                                {summoner.wins && summoner.losses && (
                                  <span className="text-primary font-medium">
                                    {Math.round(
                                      (summoner.wins / (summoner.wins + summoner.losses)) * 100,
                                    )}
                                    %
                                  </span>
                                )}
                              </div>
                            )} */}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2.5 justify-center">
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              to={"/lol/summoner/$riotID/matches"}
                              params={{ riotID: summoner.riotId.replace("#", "-") }}
                              search={{
                                q: "solo",
                              }}
                              target={"_blank"}
                            >
                              <ExternalLink className="w-4 h-4" />
                              Go to page
                            </Link>
                          </Button>
                          <Badge variant="outline">
                            {summoner.refresh?.refreshedAt ? (
                              <React.Fragment>
                                <RefreshCwIcon className="w-4 h-4" />
                                Refreshed {timeago(summoner.refresh.refreshedAt)} ago
                              </React.Fragment>
                            ) : (
                              <React.Fragment>
                                <RefreshCwOffIcon className="w-4 h-4" />
                                Not refreshed yet
                              </React.Fragment>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {summoners.length === 0 && (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2 text-card-foreground">
                    No accounts linked
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Connect your League of Legends accounts to get started
                  </p>
                  <Button
                    onClick={() => void handleLinkAccount()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    account
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => void handleLinkAccount()} variant={"secondary"}>
                <img src={riotGamesIcon} alt="" className={"w-5 rounded-md"} />
                Link another account
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
