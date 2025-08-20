import { serverEnv } from "@/server/lib/env/server";
import { serverOnly } from "@tanstack/react-start";
import ky from "ky";

export const lolClient = serverOnly(() =>
  ky.create({
    searchParams: {
      api_key: serverEnv.RIOT_API_KEY,
    },
  })
);
