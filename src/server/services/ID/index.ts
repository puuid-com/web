import { db } from "@/server/db";
import type { user } from "@/server/db/auth-schema";
import { summonerTable, type SummonerType } from "@/server/db/schema";
import type {
  AccountDTOType,
  AccountRegionDTOType,
} from "@/server/api-route/riot/account/AccountDTO";
import { AccountService } from "@/server/services/account";
import { getPartsFromRiotID } from "@/server/services/ID/utils";
import { SummonerService } from "@/server/services/Summoner";
import { and, count, eq } from "drizzle-orm";

export class IDService {
  static async getByRiotID(
    riotID: SummonerType["riotId"],
    refresh: boolean = false
  ) {
    const identifications = getPartsFromRiotID(riotID);

    const cachedRows = await db
      .select()
      .from(summonerTable)
      .where(eq(summonerTable.riotId, identifications.riotID))
      .limit(1);

    const cachedData = cachedRows.length === 1 ? cachedRows[0] : null;

    if (cachedData && !refresh) {
      return cachedData;
    }

    const account = await AccountService.getAccountByRiotID(identifications);
    const accountRegion = await AccountService.getAccountRegion(account.puuid);

    return this.handleIDCreationFromAccount(account, accountRegion);
  }

  static async getByPuuid(
    puuid: SummonerType["puuid"],
    refresh: boolean = false
  ): Promise<SummonerType> {
    const cachedRows = await db
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

    return this.handleIDCreationFromAccount(account, accountRegion);
  }

  static async handleIDCreationFromAccount(
    account: AccountDTOType,
    accountRegion: AccountRegionDTOType,
    userId: typeof user.$inferSelect.id | null = null,
    isMain: boolean = false
  ) {
    const summoner = await SummonerService.getSummonerByPuuid({
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

    await db.insert(summonerTable).values(data).onConflictDoUpdate({
      target: summonerTable.puuid,
      set: data,
    });

    return data;
  }

  static async getVerifiedIDs(userID: typeof user.$inferSelect.id) {
    return db
      .select()
      .from(summonerTable)
      .where(eq(summonerTable.verifiedUserId, userID));
  }

  static async unverifyID(
    userID: typeof user.$inferSelect.id,
    puuid: SummonerType["puuid"]
  ) {
    const whereClause = and(
      eq(summonerTable.verifiedUserId, userID),
      eq(summonerTable.puuid, puuid)
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

  static async IDIsVerified(puuid: SummonerType["puuid"]) {
    const data = await db
      .select()
      .from(summonerTable)
      .where(eq(summonerTable.puuid, puuid));

    const id = data.length === 0 ? null : data[0];

    if (!id) return false;

    return !!id.verifiedUserId;
  }

  static async verifyID(
    userID: typeof user.$inferSelect.id,
    account: AccountDTOType
  ) {
    const isAlreadyVerified = await this.IDIsVerified(account.puuid);

    if (isAlreadyVerified) {
      throw new Error("Account is already verified by a user.");
    }

    const [data] = await db
      .select({ count: count() })
      .from(summonerTable)
      .where(eq(summonerTable.verifiedUserId, userID));

    const verifiedAccounts = data?.count!;

    const accountRegion = await AccountService.getAccountRegion(account.puuid);

    return this.handleIDCreationFromAccount(
      account,
      accountRegion,
      userID,
      verifiedAccounts === 0
    );
  }
}
