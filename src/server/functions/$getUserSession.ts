import { auth } from "@puuid/core/lib/auth";
import type { UserPageSummonerTypeWithRelations } from "@puuid/core/server/db/schema/user-page";
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

  const { db } = await import("@puuid/core/server/db");
  const { UserPageService } = await import("@puuid/core/server/services/UserPageService");
  const { page } = await db.transaction((tx) => UserPageService.gerOrCreateUserPageTx(tx, user.id));

  const lists = page.summoners.reduce<{
    mainSummoner: UserPageSummonerTypeWithRelations | null;
    otherSummoners: UserPageSummonerTypeWithRelations[];
  }>(
    (acc, summoner) => {
      if (summoner.type === "MAIN") {
        acc.mainSummoner = summoner;
      } else {
        acc.otherSummoners.push(summoner);
      }

      return acc;
    },
    {
      mainSummoner: null,
      otherSummoners: [],
    },
  );

  lists.otherSummoners = lists.otherSummoners.sort((a, b) =>
    a.summoner.displayRiotId.localeCompare(b.summoner.displayRiotId),
  );

  const summoners: UserPageSummonerTypeWithRelations[] = [
    ...(lists.mainSummoner ? [lists.mainSummoner] : []),
    ...lists.otherSummoners,
  ];

  return {
    user: user,
    userPage: page,
    mainSummoner: lists.mainSummoner,
    otherSummoners: lists.otherSummoners,
    summoners: summoners,
  };
});

export type $GetUserSessionType = Awaited<ReturnType<typeof $getUserSession>>;
