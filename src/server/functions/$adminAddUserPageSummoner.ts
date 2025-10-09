import { createServerFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import { auth } from "@puuid/core/lib/auth";
import * as v from "valibot";

const AdminAddUserPageSummonerSchema = v.object({
  userPageId: v.pipe(v.string(), v.minLength(1)),
  riotId: v.pipe(v.string(), v.minLength(3)),
  type: v.picklist(["MAIN", "SMURF"]),
});

export const $adminAddUserPageSummoner = createServerFn({ method: "POST" })
  .validator(AdminAddUserPageSummonerSchema)
  .handler(async (ctx) => {
    const headers = getHeaders() as unknown as Headers;
    const session = await auth.api.getSession({
      headers,
    });

    const user = session?.user;

    if (!user || user.role !== "ADMIN") {
      throw new Response("Forbidden", { status: 403 });
    }

    const { db } = await import("@puuid/core/server/db");
    const { SummonerService } = await import("@puuid/core/server/services/SummonerService");
    const { UserPageService } = await import("@puuid/core/server/services/UserPageService");

    const riotId = ctx.data.riotId.trim();
    const { userPageId, type } = ctx.data;

    try {
      await db.transaction(async (tx) => {
        const summoner = await SummonerService.getOrCreateSummonerByRiotIDTx(tx, riotId, false);
        await UserPageService.addUserPageSummonerTx(tx, {
          userPageId,
          puuid: summoner.puuid,
          type,
          isPublic: false,
        });
      });
    } catch (error) {
      if (error instanceof Error && /duplicate key value/.test(error.message)) {
        throw new Response("Summoner already linked to a page.", { status: 409 });
      }

      throw error;
    }

    const page = await UserPageService.getUserPageById(userPageId);

    return {
      page,
    };
  });

export type $AdminAddUserPageSummonerType = Awaited<
  ReturnType<typeof $adminAddUserPageSummoner>
>;
