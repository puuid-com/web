import { clientEnv } from "@/client/lib/env/client";
import { createAuthClient } from "better-auth/react";
import { genericOAuthClient, inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: clientEnv.VITE_CLIENT_ORIGIN,
  plugins: [
    genericOAuthClient(),
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
        },
      },
    }),
  ],
});
