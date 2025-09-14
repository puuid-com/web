import { $getUserPage } from "@/server/functions/$getUserPage";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLoaderData,
  useRouteContext,
} from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/client/components/ui/card";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/client/components/ui/avatar";
import { Pencil as PencilIcon, ChevronRight as ChevronRightIcon } from "lucide-react";
import { SiTwitch, SiX } from "@icons-pack/react-simple-icons";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import { DDragonService } from "@/shared/services/DDragon/DDragonService";
import { timeago } from "@/client/lib/utils";

export const Route = createFileRoute("/page/$name")({
  component: RouteComponent,
  loader: async (ctx) => {
    const { name } = ctx.params;
    const { page } = await $getUserPage({ data: { name } });

    if (!page) {
      throw redirect({ to: "/" });
    }

    return {
      page,
    };
  },
});

function RouteComponent() {
  const { page } = Route.useLoaderData();

  const session = useRouteContext({ from: "__root__" });
  const { champions } = useLoaderData({ from: "__root__" });

  const isOwner = session.userPage?.id === page.id;

  const createdAt = page.createdAt;
  const memberSince = new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "numeric",
  }).format(createdAt);

  const xUrl = page.xUsername ? `https://x.com/${page.xUsername}` : null;
  const twitchUrl = page.twitchUsername ? `https://twitch.tv/${page.twitchUsername}` : null;

  const pageSummoners = page.summoners;

  // Pick a representative champion for the header background (like summoner page)
  const headerStat = pageSummoners
    .map(
      (ps) =>
        ps.summoner.statistics.find((s) => s.queueType === "RANKED_SOLO_5x5") ??
        ps.summoner.statistics.at(0),
    )
    .find(Boolean);
  const headerBg = headerStat
    ? CDragonService.getChampionSplashArtCentered(headerStat.mainChampionId)
    : undefined;

  return (
    <div
      className="container mx-auto px-4 py-6"
      style={{ minHeight: "var(--body-content-height)" }}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main content */}
        <main className="min-w-0">
          {/* Header styled like Summoner page */}
          <div
            className="rounded-b-3xl flex relative justify-between bg-main/10 bg-cover bg-blend-exclusion bg-no-repeat bg-[position:50%_-200px] min-h-[160px]"
            style={{ backgroundImage: headerBg ? `url(${headerBg})` : undefined }}
          >
            <div className="absolute top-0 right-0 m-1.5 flex gap-1.5 items-center">
              {isOwner ? (
                <Button asChild size="sm" variant="secondary">
                  <Link to="/user/settings">
                    <PencilIcon className="size-4" /> Edit
                  </Link>
                </Button>
              ) : null}
            </div>
            <div className="flex flex-col h-full justify-start">
              <div className="flex gap-2.5">
                <div
                  className="m-5 relative object-cover bg-cover w-24 aspect-square rounded-md border border-neutral-800"
                  style={{ backgroundImage: `url(${page.profileImage})` }}
                >
                  <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2">
                    {page.isPublic ? (
                      <Badge variant="secondary" className="border-main/ bg-main/70">
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-neutral-700 bg-neutral-900/70">
                        Private
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-1.5 p-5 pl-0">
                  <div className="flex flex-col">
                    <div className="flex gap-2.5 items-center min-w-0">
                      <h1 className="text-2xl flex gap-2 items-center min-w-0">
                        <span className="font-bold break-words line-clamp-2">
                          {page.displayName}
                        </span>
                      </h1>
                    </div>
                    <div className="text-neutral-300 text-sm">
                      {memberSince ? `Member since ${memberSince}` : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {xUrl ? (
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neutral-300"
                      >
                        <a
                          href={xUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="X profile"
                        >
                          <SiX color={"white"} className="size-4" />
                        </a>
                      </Button>
                    ) : null}
                    {twitchUrl ? (
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neutral-300"
                      >
                        <a
                          href={twitchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Twitch profile"
                        >
                          <SiTwitch className="size-4" color={"default"} />
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder for future center content */}
          <div className="h-20" />
          <Outlet />
        </main>

        {/* Right panel: Summoners list */}
        <aside className="space-y-6 self-start lg:sticky lg:top-6">
          <Card className="border-neutral-800 bg-neutral-900/70 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-neutral-200">Summoners</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {pageSummoners.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
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
                            <AvatarFallback>
                              {(gameName || "?").slice(0, 1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <h3 className="text-sm font-medium text-neutral-100 truncate">
                                {gameName}
                              </h3>
                              <span className="text-xs text-neutral-400 shrink-0">#{tagLine}</span>
                              <Badge variant="secondary" className="text-[10px] leading-4 shrink-0">
                                Lv. {summoner.summonerLevel}
                              </Badge>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-neutral-300">
                              <Badge variant="outline" className="gap-1">
                                {type}
                              </Badge>
                              {mainStats ? (
                                <Badge variant={"main"}>
                                  <img
                                    src={CDragonService.getChampionSquare(mainStats.mainChampionId)}
                                    alt={`${DDragonService.getChampionName(champions, mainStats.mainChampionId)} icon`}
                                    className={"w-3 rounded-md"}
                                  />
                                  {DDragonService.getChampionName(
                                    champions,
                                    mainStats.mainChampionId,
                                  )}
                                </Badge>
                              ) : null}
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
        </aside>
      </div>
    </div>
  );
}
