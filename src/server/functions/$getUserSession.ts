import { auth } from "@/lib/auth";
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

  const { SummonerService } = await import("@/server/services/summoner");

  const summoners = await SummonerService.getVerifiedSummoners(user.id);

  const mainAccount = summoners.find((s) => s.isMain);
  const otherAccounts = summoners.filter((s) => !s.isMain);

  return {
    user: user,
    mainSummoner: mainAccount,
    otherSummoners: otherAccounts,
    summoners: summoners.sort((a, b) => {
      // First, sort by isMain (main accounts first)
      if (a.isMain !== b.isMain) {
        return a.isMain ? -1 : 1;
      }
      // Then sort by summonerLevel in descending order
      return b.summonerLevel - a.summonerLevel;
    }),
  };
});

export type $GetUserSessionType = Awaited<ReturnType<typeof $getUserSession>>;
