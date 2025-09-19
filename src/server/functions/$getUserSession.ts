import { auth } from "@puuid/core";
import type { UserPageSummonerTypeWithRelations } from "@puuid/core";
import { createServerFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";

export const $getUserSession = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getHeaders() as unknown as Headers;

  const session = await auth.api.getSession({
    headers: headers,
  });

  const user = session?.user;

  if (!user) {
    return {
      user: null,
    };
  }

  const { db } = await import("@puuid/core");
  const { UserPageService } = await import("@puuid/core");
  const { page } = await db.transaction((tx) => UserPageService.gerOrCreateUserPageTx(tx, user.id));

  const { mainSummoner, otherSummoners, summoners } = page.summoners.reduce<{
    mainSummoner: UserPageSummonerTypeWithRelations | null;
    otherSummoners: UserPageSummonerTypeWithRelations[];
    summoners: UserPageSummonerTypeWithRelations[];
  }>(
    (acc, summoner) => {
      if (summoner.type === "MAIN") {
        acc.mainSummoner = summoner;
      } else {
        acc.otherSummoners.push(summoner);
      }
      acc.summoners.push(summoner);

      return acc;
    },
    {
      mainSummoner: null,
      otherSummoners: [],
      summoners: [],
    },
  );

  return {
    user: user,
    userPage: page,
    mainSummoner: mainSummoner,
    otherSummoners: otherSummoners,
    summoners: summoners.sort((a, b) => {
      // First, sort by isMain (main accounts first)
      if (a.type !== b.type) {
        return a.type === "MAIN" ? -1 : 1;
      }
      // Then sort by summonerLevel in descending order
      return b.summoner.summonerLevel - a.summoner.summonerLevel;
    }),
  };
});

export type $GetUserSessionType = Awaited<ReturnType<typeof $getUserSession>>;
