import { $tryUserMiddleware } from "@/server/middleware/$tryUserMiddleware";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $searchSummonersOrPages = createServerFn({ method: "GET" })
  .middleware([$tryUserMiddleware])
  .validator(
    v.object({
      c: v.string(),
      excludeSummoners: v.optional(v.boolean(), false),
      excludeUserPages: v.optional(v.boolean(), false),
    }),
  )
  .handler(async (ctx) => {
    const userId = ctx.context.userId;

    const { SearchService } = await import("@puuid/core/server/services/SearchService");
    const data = await SearchService.searchSummonersAndUserPage({
      userId,
      search: ctx.data.c,
      limit: 6,
      excludeSummoners: ctx.data.excludeSummoners,
      excludeUserPages: ctx.data.excludeUserPages,
    });

    return data;
  });

export type $SearchSummonersOrPageType = Awaited<ReturnType<typeof $searchSummonersOrPages>>;
