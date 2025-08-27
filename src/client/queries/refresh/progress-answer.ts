import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";
import { $stremedSummonerRefresh } from "@/server/functions/$stremedSummonerRefresh";
import type { RefreshProgressMsgType } from "@/server/services/refresh";
import type { LolRegionType } from "@/server/types/riot/common";

type Args = { puuid: string; region: LolRegionType; queue: LolQueueType };

export function progressAnswer(args: Args, signal: AbortSignal) {
  return {
    async *[Symbol.asyncIterator](): AsyncGenerator<RefreshProgressMsgType, void, void> {
      const res = await $stremedSummonerRefresh({ data: args, signal });
      if (!res.body) return;

      const textStream = res.body.pipeThrough(new TextDecoderStream());

      // closure au lieu de this.buf
      let buf = "";
      const lineSplitter = new TransformStream<string, string>({
        transform(chunk, controller) {
          buf += chunk;
          let idx;
          while ((idx = buf.indexOf("\n")) !== -1) {
            const line = buf.slice(0, idx).trim();
            buf = buf.slice(idx + 1);
            if (line) controller.enqueue(line);
          }
        },
        flush(controller) {
          const last = buf.trim();
          if (last) controller.enqueue(last);
        },
      });

      const lines = textStream.pipeThrough(lineSplitter);

      // helper pour itérer proprement un ReadableStream en TS
      async function* streamToAsyncIterable<T>(rs: ReadableStream<T>) {
        const reader = rs.getReader();
        try {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            yield value;
          }
        } finally {
          reader.releaseLock();
        }
      }

      for await (const line of streamToAsyncIterable(lines)) {
        try {
          const msg = JSON.parse(line as unknown as string) as RefreshProgressMsgType;

          yield msg;
        } catch {
          // ignore
        }
      }
    },
  };
}
