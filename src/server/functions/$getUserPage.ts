import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getUserPage = createServerFn({ method: "GET" })
  .validator(
    v.object({
      name: v.string(),
    }),
  )
  .handler(async (ctx) => {
    const { UserPage } = await import("@/server/services/UserPageService");
    const page = await UserPage.getUserPage(ctx.data.name);

    return {
      page,
    };
  });

export type $getUserPageType = Awaited<ReturnType<typeof $getUserPage>>;
