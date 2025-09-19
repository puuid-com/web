import { auth } from "@puuid/core/lib/auth";
import { createMiddleware } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";

export const $tryUserMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const headers = getHeaders() as unknown as Headers;

    const session = await auth.api.getSession({
      headers: headers,
    });

    const userId = session?.user.id;

    return await next({
      context: {
        userId,
      },
    });
  },
);
