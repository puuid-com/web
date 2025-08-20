import type { QueueType } from "@/server/api-route/riot/league/LeagueDTO";
import { type TransactionType } from "@/server/db";
import { summonerTable } from "@/server/db/schema";
import { IDService } from "@/server/services/ID";
import { LeagueService } from "@/server/services/League";
import { MatchService } from "@/server/services/Match";
import { LOL_QUEUES } from "@/server/services/Match/queues.type";
import { eq } from "drizzle-orm";

export class RefreshService {
  static async refreshSummonerDataTx(
    tx: TransactionType,
    puuid: string,
    queueType: QueueType
  ) {
    const data = await IDService.getByPuuidTx(tx, puuid, true);
    await MatchService.getAllMatchesDTOByPuuidTx(
      tx,
      data,
      LOL_QUEUES[queueType].queueId
    );
    await LeagueService.cacheLeaguesTx(tx, data);

    await tx
      .update(summonerTable)
      .set({
        refreshedAt: new Date(),
      })
      .where(eq(summonerTable.puuid, puuid));
  }
}
