import { $authMiddleware } from "@/server/middleware/$authMiddleware";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

export const $postUserPage = createServerFn({ method: "POST" })
  .middleware([$authMiddleware])
  .handler(async (ctx) => {
    const { user } = ctx.context;

    const { SummonerService } = await import("@/server/services/summoner/SummonerService");
    const mainSummoner = await SummonerService.getMainSummoner(user.id);

    if (!mainSummoner) {
      throw redirect({
        to: "/",
      });
    }

    const { UserPage } = await import("@/server/services/UserPageService");
    const newPage = await UserPage.createUserPageTx({
      userId: user.id,
      displayName: mainSummoner.displayRiotId,
      isPublic: false,
      type: "DEFAULT",
      profileImage: CDragonService.getProfileIcon(mainSummoner.profileIconId),
    });

    return {
      page: newPage,
    };
  });

export type $postUserPageType = Awaited<ReturnType<typeof $postUserPage>>;
