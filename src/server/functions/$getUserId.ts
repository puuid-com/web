import { $authMiddleware } from "@/server/middleware/$authMiddleware";
import { createServerFn } from "@tanstack/react-start";

export const $getAuthUser = createServerFn({ method: "GET" })
  .middleware([$authMiddleware])
  .handler((ctx) => {
    return ctx.context.user;
  });

export type $GetUserIdType = Awaited<ReturnType<typeof $getAuthUser>>;
