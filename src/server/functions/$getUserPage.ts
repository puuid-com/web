import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getUserPage = createServerFn({ method: "GET" })
  .validator(
    v.object({
      name: v.string(),
    }),
  )
  .handler(async (ctx) => {
    const { UserPageService } = await import("@puuid/core/server/services/UserPageService");
    const page = await UserPageService.getUserPage(ctx.data.name);

    return {
      page,
    };
  });

export type $getUserPageType = Awaited<ReturnType<typeof $getUserPage>>;
