import { serverEnv } from "@/server/lib/env/server";
import { serverOnly } from "@tanstack/react-start";
import ky from "ky";

export const lolClient = serverOnly(() =>
  ky.create({
    retry: {
      limit: 2, // ajuste à 0 si tu veux zéro retry même réseau
      statusCodes: [], // vide, donc aucun retry déclenché par un code HTTP
    },

    timeout: 30_000,

    searchParams: {
      api_key: serverEnv.RIOT_API_KEY,
    },
    hooks: {
      afterResponse: [
        (req, opt, res) => {
          // console.log(`🚨🚨 [${res.status}] \t`, req.url);
        },
      ],
      beforeRetry: [
        async ({ error, retryCount, request }) => {
          // appelé uniquement pour des erreurs réseau, jamais pour 4xx ou 5xx
          const url = request.url;
          const wait = Math.min(250 * 2 ** retryCount, 1_000);
          console.warn(
            `network retry ${retryCount + 1} on ${url}, cause ${error?.cause ?? error?.name ?? "unknown"}`
          );
          await new Promise((r) => setTimeout(r, wait));
        },
      ],
    },
  })
);
