import { db } from "@/server/db";
import { followingTable } from "@/server/db/schema/following";
import { and, eq, sql } from "drizzle-orm";

export class FollowService {
  static async followSummoner(puuid: string, userId: string) {
    return db.insert(followingTable).values({ puuid, userId });
  }

  static async unfollowSummoner(puuid: string, userId: string) {
    return db
      .delete(followingTable)
      .where(and(eq(followingTable.puuid, puuid), eq(followingTable.userId, userId)));
  }

  static async getFollowersCount(puuid: string) {
    const [data] = await db
      .select({ count: sql<number>`count(*)` })
      .from(followingTable)
      .where(eq(followingTable.puuid, puuid));

    return data?.count ?? 0;
  }

  static async getFollowing(userId: string) {
    return db.query.followingTable.findMany({
      where: eq(followingTable.userId, userId),
      with: {
        summoner: true,
      },
    });
  }

  static async isFollowing(puuid: string, userId: string) {
    const data = await db.query.followingTable.findFirst({
      where: and(eq(followingTable.puuid, puuid), eq(followingTable.userId, userId)),
    });

    return !!data;
  }
}
