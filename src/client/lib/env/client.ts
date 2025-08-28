import { createEnv } from "@t3-oss/env-core";
import * as v from "valibot";

export const clientEnv = createEnv({
  client: {
    VITE_CLIENT_ORIGIN: v.string(),
  },
  extends: [],
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
  clientPrefix: "VITE_",
});
