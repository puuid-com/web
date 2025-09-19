import { $authMiddleware } from "@/server/middleware/$authMiddleware";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $upsertSummonerNotes = createServerFn({ method: "GET" })
  .middleware([$authMiddleware])
  .validator(
    v.object({
      puuid: v.string(),
      notes: v.string(),
    }),
  )
  .handler(async (ctx) => {
    const user = ctx.context.user;
    const { puuid, notes } = ctx.data;

    const { NotesService } = await import("@puuid/core/server/services/NotesService");
    const data = await NotesService.upsertSummonerNotes({
      puuid,
      userId: user.id,
      note: notes,
    });

    return data;
  });

export type $upsertSummonerNotesType = Awaited<ReturnType<typeof $upsertSummonerNotes>>;
