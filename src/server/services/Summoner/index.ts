import { db, type TransactionType } from "@/server/db";
import { user } from "@/server/db/auth-schema";
import {
  summonerTable,
  type SummonerType,
  type SummonerWithRelationsType,
} from "@/server/db/schema";
import type {
  AccountDTOType,
  AccountRegionDTOType,
} from "@/server/api-route/riot/account/AccountDTO";
import { AccountService } from "@/server/services/account";
import { getPartsFromRiotID } from "@/server/services/summoner/utils";
import { SummonerDTOService } from "@/server/services/summoner-dto";
import { and, desc, eq } from "drizzle-orm";

export class SummonerService {
  static async getSummoners() {
    return db.query.summonerTable.findMany({
      with: {
        statistics: true,
        leagues: true,
      },
      limit: 25,
      orderBy: [summonerTable.region, desc(summonerTable.summonerLevel)],
    });
  }

  static async getSummonerByRiotIDTx(
    tx: TransactionType,
    riotID: SummonerType["riotId"],
    refresh = false,
  ): Promise<SummonerWithRelationsType> {
    const identifications = getPartsFromRiotID(riotID);

    const cachedData = refresh
      ? undefined
      : await tx.query.summonerTable.findFirst({
          where: eq(summonerTable.riotId, identifications.riotID),
          with: {
            statistics: {
              with: {
                league: true,
              },
            },
            leagues: true,
            refresh: true,
          },
        });

    if (cachedData && !refresh) {
      return cachedData;
    }

    const account = await AccountService.getAccountByRiotID(identifications);
    const accountRegion = await AccountService.getAccountRegion(account.puuid);

    return this.handleSummonerCreationFromAccountTx(tx, account, accountRegion);
  }

  static async getSummonerByPuuidTx(
    tx: TransactionType,
    puuid: SummonerType["puuid"],
    refresh = false,
  ): Promise<SummonerType> {
    const cachedRows = await tx
      .select()
      .from(summonerTable)
      .where(eq(summonerTable.puuid, puuid))
      .limit(1);

    const cachedData = cachedRows.length === 1 ? cachedRows[0] : null;

    if (cachedData && !refresh) {
      return cachedData;
    }

    const account = await AccountService.getAccountByPuuid({ puuid });
    const accountRegion = await AccountService.getAccountRegion(account.puuid);

    return this.handleSummonerCreationFromAccountTx(tx, account, accountRegion);
  }

  static async handleSummonerCreationFromAccountTx(
    tx: TransactionType,
    account: AccountDTOType,
    accountRegion: AccountRegionDTOType,
    userId: typeof user.$inferSelect.id | null = null,
    isMain = false,
  ): Promise<SummonerWithRelationsType> {
    const summoner = await SummonerDTOService.getSummonerDTOByPuuid({
      puuid: account.puuid,
      region: accountRegion.region,
    });

    const data: SummonerType = {
      puuid: account.puuid,
      riotId: `${account.gameName}#${account.tagLine}`,
      summonerLevel: summoner.summonerLevel,
      profileIconId: summoner.profileIconId,
      region: accountRegion.region,
      createdAt: new Date(),
      verifiedUserId: userId,
      isMain: isMain,
    };

    await tx.insert(summonerTable).values(data).onConflictDoUpdate({
      target: summonerTable.puuid,
      set: data,
    });

    return {
      ...data,
      statistics: [],
      leagues: [],
      refresh: null,
    };
  }

  static async getVerifiedSummoners(userID: typeof user.$inferSelect.id) {
    return db.select().from(summonerTable).where(eq(summonerTable.verifiedUserId, userID));
  }

  static async unverifySummoner(userID: typeof user.$inferSelect.id, puuid: SummonerType["puuid"]) {
    const whereClause = and(
      eq(summonerTable.verifiedUserId, userID),
      eq(summonerTable.puuid, puuid),
    );

    const data = await db.select().from(summonerTable).where(whereClause);

    const idData = data.length === 0 ? null : data[0];

    if (!idData) {
      throw new Error("No verified account");
    }

    return await db
      .update(summonerTable)
      .set({
        verifiedUserId: null,
      })
      .where(whereClause)
      .returning();
  }

  static async SummonerIsVerifiedTx(tx: TransactionType, puuid: SummonerType["puuid"]) {
    const data = await tx.select().from(summonerTable).where(eq(summonerTable.puuid, puuid));

    const id = data.length === 0 ? null : data[0];

    if (!id) return false;

    return !!id.verifiedUserId;
  }

  static async verifySummonerTx(
    tx: TransactionType,
    userID: typeof user.$inferSelect.id,
    account: AccountDTOType,
  ) {
    const isAlreadyVerified = await this.SummonerIsVerifiedTx(tx, account.puuid);

    if (isAlreadyVerified) {
      throw new Error("Account is already verified by a user.");
    }

    const verifiedAccounts = await tx.query.summonerTable.findMany({
      where: eq(summonerTable.verifiedUserId, user),
    });

    const accountRegion = await AccountService.getAccountRegion(account.puuid);

    return this.handleSummonerCreationFromAccountTx(
      tx,
      account,
      accountRegion,
      userID,
      verifiedAccounts.length === 0,
    );
  }
}
