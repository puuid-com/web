import { normalizeString } from "@/lib/riotID";
import { db, type TransactionType } from "@/server/db";
import {
  userPageTable,
  type UserPageInsertType,
  type UserPageRowType,
  type UserPageUpdateType,
} from "@/server/db/schema/user-page";
import { SummonerService } from "@/server/services/summoner/SummonerService";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import type { User } from "better-auth";
import { desc, eq, ilike, sql } from "drizzle-orm";

export class UserPage {
  static async gerOrCreateUserPage(userId: User["id"]) {
    const page = await this.getUserPageByUser(userId);

    if (page) return page;

    const mainSummoner = await SummonerService.getMainSummoner(userId);

    if (!mainSummoner) {
      throw new Error("No main summoner for the user");
    }

    return db.transaction((tx) =>
      this.createUserPageTx(tx, {
        userId,
        displayName: mainSummoner.displayRiotId,
        isPublic: false,
        profileImage: CDragonService.getProfileIcon(mainSummoner.profileIconId),
        type: "DEFAULT",
      }),
    );
  }

  static async getUserPageByUser(userId: User["id"]) {
    return db.query.userPageTable.findFirst({
      where: eq(userPageTable.userId, userId),
    });
  }

  static async createUserPageTx(
    tx: TransactionType,
    data: Omit<UserPageInsertType, "normalizedName">,
  ) {
    const [userPage] = await tx
      .insert(userPageTable)
      .values({
        ...data,
        normalizedName: normalizeString(data.displayName),
      })
      .returning();

    if (!userPage) {
      throw new Error("Error creating user page.");
    }

    return userPage;
  }

  static async searchUserPage(search: string) {
    const norm = normalizeString(search);
    const pattern = `%${norm}%`;
    const prefixPattern = `${norm}%`;

    // Similarity score using Jaro-Winkler, with a tiny prefix boost
    const sim = sql<number>`jarowinkler(${userPageTable.normalizedName}, ${norm})`;
    const score = sql<number>`
      ${sim}
      + (CASE WHEN ${userPageTable.normalizedName} ILIKE ${prefixPattern} THEN 0.001 ELSE 0 END)
    `;

    return db
      .select()
      .from(userPageTable)
      .where(ilike(userPageTable.normalizedName, pattern))
      .orderBy(desc(score), userPageTable.displayName);
  }

  static async getUserPage(displayName: string) {
    const normalizedName = normalizeString(displayName);

    return db.query.userPageTable.findFirst({
      where: eq(userPageTable.normalizedName, normalizedName),
    });
  }

  static async updateUserPage(id: UserPageRowType["id"], data: UserPageUpdateType) {
    return db
      .update(userPageTable)
      .set({
        ...data,
        ...(data.displayName ? { normalizedName: normalizeString(data.displayName) } : {}),
      })
      .where(eq(userPageTable.id, id));
  }
}
