import { $authMiddleware } from "@/server/middleware/$authMiddleware";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerNotes = createServerFn({ method: "GET" })
  .middleware([$authMiddleware])
  .validator(
    v.object({
      puuid: v.string(),
    }),
  )
  .handler(async (ctx) => {
    const user = ctx.context.user;
    const { puuid } = ctx.data;

    const { NotesService } = await import("@/server/services/NotesService");
    const data = await NotesService.getSummonerNotes({
      puuid,
      userId: user.id,
    });

    return data ?? null;
  });

export type $getSummonerNotesType = Awaited<ReturnType<typeof $getSummonerNotes>>;
