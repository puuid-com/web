import { LolQueues, LolRegions } from "@puuid/core/shared/types/index";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $streamedSummonerRefresh = createServerFn({
  method: "POST",
  response: "raw",
})
  .validator(
    v.object({
      puuid: v.string(),
      region: v.picklist(LolRegions),
      queue: v.picklist(LolQueues),
    }),
  )
  .handler(async ({ data, signal }) => {
    const { RefreshService } = await import("@puuid/core/server/services/RefreshService");

    const { puuid, queue } = data;

    const canRefresh = await RefreshService.canRefresh(puuid, queue);

    if (!canRefresh) {
      return new Response("Not allowed", { status: 403 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (obj: unknown) => {
          controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
        };

        try {
          for await (const msg of RefreshService.refreshSummonerData(puuid, queue)) {
            if (signal.aborted) break;
            send(msg);
          }
        } catch (e) {
          console.error("Error occurred while streaming:", e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
        Connection: "keep-alive",
      },
    });
  });
