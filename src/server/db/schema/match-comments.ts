import { user } from "@/server/db/schema/auth";
import { matchTable } from "@/server/db/schema/match";
import { summonerTable } from "@/server/db/schema/summoner";
import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export const matchCommentTable = pgTable(
  "match_comment",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    puuid: text("puuid")
      .references(() => summonerTable.puuid, { onDelete: "cascade" })
      .notNull(),
    matchId: text("match_id")
      .references(() => matchTable.matchId, { onDelete: "cascade" })
      .notNull(),
    text: text("text").notNull(),
    tags: text("tags").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_mc_matchid").on(t.matchId), index("idx_mc_userid").on(t.userId)],
);

export type MatchCommentRowType = typeof matchCommentTable.$inferSelect;
export type InsertMatchCommentRowType = typeof matchCommentTable.$inferInsert;

export const matchCommentTableRelations = relations(matchCommentTable, ({ one }) => ({
  summoner: one(summonerTable, {
    fields: [matchCommentTable.puuid],
    references: [summonerTable.puuid],
  }),
  user: one(user, {
    fields: [matchCommentTable.userId],
    references: [user.id],
  }),
  match: one(matchTable, {
    fields: [matchCommentTable.matchId],
    references: [matchTable.matchId],
  }),
}));
