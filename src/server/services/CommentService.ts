import { db } from "@/server/db";
import type { MatchRowType } from "@/server/db/schema/match";
import {
  matchCommentTable,
  type InsertMatchCommentRowType,
} from "@/server/db/schema/match-comments";
import { MatchService } from "@/server/services/match/MatchService";
import { SummonerService } from "@/server/services/summoner/SummonerService";
import type { User } from "better-auth";
import { eq } from "drizzle-orm";

export class CommentService {
  static async createComment(
    data: Pick<InsertMatchCommentRowType, "matchId" | "puuid" | "userId" | "tags" | "text">,
  ) {
    await SummonerService.assertSummonerIsVerifyByUserId(data.puuid, data.userId);
    await MatchService.assertSummonerWasInMatch(data.puuid, data.matchId);

    const insertData: InsertMatchCommentRowType = {
      ...data,
    };

    const comment = await db.insert(matchCommentTable).values(insertData).returning();

    return comment;
  }

  static async getMatchComments(matchId: MatchRowType["matchId"]) {
    return db.query.matchCommentTable.findMany({
      where: eq(matchCommentTable.matchId, matchId),
    });
  }

  static async getUserComments(userId: User["id"]) {
    return db.query.matchCommentTable.findMany({
      where: eq(matchCommentTable.userId, userId),
      with: {
        match: true,
        summoner: true,
      },
    });
  }
}
