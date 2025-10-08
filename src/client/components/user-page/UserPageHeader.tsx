import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { CDragonService } from "@puuid/core/shared/services/CDragonService";
import { SiTwitch, SiX } from "@icons-pack/react-simple-icons";
import { Link, useLoaderData } from "@tanstack/react-router";
import { PencilIcon } from "lucide-react";
import { combinedSummonerLevels } from "@puuid/core/shared";

type Props = {};

export const UserPageHeader = ({}: Props) => {
  const { page, isOwner } = useLoaderData({ from: "/page/$name" });

  const createdAt = page.createdAt;
  const memberSince = new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "numeric",
  }).format(createdAt);

  const pageSummoners = page.summoners;

  const headerStat = pageSummoners
    .map(
      (ps) =>
        ps.summoner.refreshes.find((s) => s.queueType === "RANKED_SOLO_5x5") ??
        ps.summoner.refreshes.at(0),
    )
    .find(Boolean);
  const headerBg = headerStat?.summonerStatistic?.mainChampionId
    ? CDragonService.getChampionSplashArtCentered(headerStat.summonerStatistic.mainChampionId)
    : undefined;

  const xUrl = page.xUsername ? `https://x.com/${page.xUsername}` : null;
  const twitchUrl = page.twitchUsername ? `https://twitch.tv/${page.twitchUsername}` : null;

  const combinedLevel = combinedSummonerLevels(pageSummoners.map((s) => s.summoner.summonerLevel));

  return (
    <div
      className="rounded-b-3xl flex relative justify-between bg-main/10 bg-cover bg-blend-exclusion bg-no-repeat bg-[position:50%_-200px] h-[200px]"
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
              <Badge variant="secondary" className="border-main/ bg-main/70">
                {combinedLevel.level}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-1.5 p-5 pl-0">
            <div className="flex flex-col">
              <div className="flex gap-2.5 items-center min-w-0">
                <h1 className="text-2xl flex gap-2 items-center min-w-0">
                  <span className="font-bold break-words line-clamp-2">{page.displayName}</span>
                </h1>
              </div>
              <div className="text-neutral-300 text-sm">
                {memberSince ? `Member since ${memberSince}` : null}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {xUrl ? (
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-neutral-300">
                  <a href={xUrl} target="_blank" rel="noopener noreferrer" aria-label="X profile">
                    <SiX color={"white"} className="size-4" />
                  </a>
                </Button>
              ) : null}
              {twitchUrl ? (
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-neutral-300">
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
  );
};
