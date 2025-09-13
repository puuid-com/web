import { user } from "@/server/db/schema/auth";
import { relations } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export type UserPageType = "DEFAULT";

export const userPageTable = pgTable(
  "user_page",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),

    displayName: text("display_name").notNull(),
    normalizedName: text("normalized_name").notNull(),

    description: text("description"),
    profileImage: text("profile_image").notNull(),
    xUsername: text("x_username"),
    twitchUsername: text("twitch_username"),

    type: text("text").$type<UserPageType>().notNull(),

    isPublic: boolean("is_public").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx").on(t.normalizedName, t.isPublic),
    unique("uq_name").on(t.normalizedName, t.displayName),
  ],
);

export type UserPageRowType = typeof userPageTable.$inferSelect;
export type UserPageInsertType = typeof userPageTable.$inferInsert;
export type UserPageUpdateType = Partial<
  Omit<UserPageInsertType, "id" | "userId" | "createdAt" | "normalizedName" | "type">
>;

export const userPageTableRelations = relations(userPageTable, ({ one }) => ({
  user: one(user),
}));
