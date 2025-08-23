import { serverEnv } from "@/server/lib/env/server";
import { serverOnly } from "@tanstack/react-start";
import ky from "ky";

export const lolClient = serverOnly(() =>
  ky.create({
    retry: 0,
    searchParams: {
      api_key: serverEnv.RIOT_API_KEY,
    },
    hooks: {
      afterResponse: [
        (req, opt, res) => {
          console.log(`🚨🚨 [${res.status}] \t`, req.url);
        },
      ],
    },
  })
);
