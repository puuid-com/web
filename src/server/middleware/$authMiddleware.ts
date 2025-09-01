import { auth } from "@/lib/auth";
import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";

export const $authMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const headers = getHeaders() as unknown as Headers;

  const session = await auth.api.getSession({
    headers: headers,
  });

  const user = session?.user;

  if (!user) {
    throw redirect({
      to: "/",
    });
  }

  const { SummonerService } = await import("@/server/services/summoner/SummonerService");
  const puuids = await SummonerService.getVerifiedPuuids(user.id);

  return await next({
    context: {
      user: session.user,
      verifiedPuuids: puuids,
    },
  });
});
