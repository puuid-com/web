import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

type Detection =
  | { kind: "puuid" }
  | { kind: "riotId"; gameName: string; tagLine: string }
  | { kind: "invalid"; reason: string };

const PUUID_RE = /^[A-Za-z0-9_-]{78}$/;
const TAG_RE = /^[A-Za-z0-9]{3,5}$/;

export function detectRiotIdentifier(id: string): Detection {
  const input = id.trim();

  // Riot ID
  const hash = input.indexOf("#");
  if (hash !== -1) {
    const gameName = input.slice(0, hash).trim();
    const tagLine = input.slice(hash + 1).trim();

    if (gameName.length < 3 || gameName.length > 16) {
      return { kind: "invalid", reason: "gameName length must be 3 to 16" };
    }
    if (gameName.includes("#")) {
      return { kind: "invalid", reason: "gameName cannot contain #" };
    }
    if (!TAG_RE.test(tagLine)) {
      return { kind: "invalid", reason: "tagLine must be 3 to 5 alphanumeric" };
    }
    return { kind: "riotId", gameName, tagLine };
  }

  // PUUID
  if (PUUID_RE.test(input)) {
    return { kind: "puuid" };
  }

  return { kind: "invalid", reason: "not a PUUID or Riot ID" };
}

export const $getPuuidFromID = createServerFn({ method: "GET" })
  .validator((raw) =>
    v.parse(
      v.object({
        id: v.string(),
      }),
      raw
    )
  )
  .handler(async (ctx) => {
    const { id } = ctx.data;

    const type = detectRiotIdentifier(id);

    if (type.kind === "invalid") {
      return null;
    }

    if (type.kind === "puuid") {
      return id;
    }

    const { SummonerService } = await import("@/server/services/summoner");
    const { db } = await import("@/server/db");
    const summoner = await db.transaction((tx) =>
      SummonerService.getSummonerByRiotIDTx(tx, id)
    );

    return summoner.puuid;
  });
