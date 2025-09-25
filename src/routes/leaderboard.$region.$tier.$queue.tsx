import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { $getLeaderboard } from "@/server/functions/$getLeaderboard";
import { CDragonService, LolApexTiers, LolQueues, LolRegions } from "@puuid/core/shared";
import { createFileRoute } from "@tanstack/react-router";
import * as v from "valibot";

export const Route = createFileRoute("/leaderboard/$region/$tier/$queue")({
  component: RouteComponent,
  params: {
    parse: (raw) =>
      v.parse(
        v.object({
          tier: v.picklist(LolApexTiers),
          region: v.picklist(LolRegions),
          queue: v.picklist(LolQueues),
        }),
        raw,
      ),
  },
  loader: async (ctx) => {
    return $getLeaderboard({ data: ctx.params });
  },
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const leaderboard = Route.useLoaderData();

  return (
    <div className={"container mx-auto"}>
      <div>
        <div>
          {LolRegions.map((r) => (
            <Button
              id={`leaderboard-region-${r}`}
              onClick={() => {
                navigate({
                  to: ".",
                  params: (p) => ({ ...p, region: r }),
                }).catch(console.error);
              }}
            >
              {r}
            </Button>
          ))}
        </div>
        <div>
          {LolApexTiers.map((r) => (
            <Button
              id={`leaderboard-tiers-${r}`}
              onClick={() => {
                navigate({
                  to: ".",
                  params: (p) => ({ ...p, tier: r }),
                }).catch(console.error);
              }}
            >
              {r}
            </Button>
          ))}
        </div>
        <div>
          {LolQueues.map((r) => (
            <Button
              id={`leaderboard-queue-${r}`}
              onClick={() => {
                navigate({
                  to: ".",
                  params: (p) => ({ ...p, queue: r }),
                }).catch(console.error);
              }}
            >
              {r}
            </Button>
          ))}
        </div>
      </div>
      <div>Hello "/leaderboard/$region/$tier/$queue"!</div>
      <div>
        {leaderboard ? (
          <div>
            <div>{leaderboard.id}</div>
            <div className={"flex flex-col gap-2.5 bg-blue-200/10"}>
              {leaderboard.entries.map((entity) => {
                return (
                  <div
                    id={`${entity.leaderboardId}#${entity.dayIndex}`}
                    className={"flex flex-row gap-2.5 items-center bg-red-200/10 rounded-md"}
                  >
                    <div>
                      <Badge>{entity.dayIndex + 1}</Badge>
                    </div>
                    <div>
                      <div className={"flex items-center"}>
                        <img
                          src={CDragonService.getProfileIcon(entity.league.summoner.profileIconId)}
                          className={"w-12 aspect-square"}
                          alt=""
                        />
                        <div>{entity.league.summoner.displayRiotId}</div>
                      </div>
                    </div>
                    <div>{entity.league.leaguePoints} LP</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>No data for this leaderboard</div>
        )}
      </div>
    </div>
  );
}
