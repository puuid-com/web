// progress-answer.ts
import {
  $streamSimpleProgress,
  type SimpleProgressMsg,
} from "@/server/functions/$streamSimpleProgress";

type Args = { puuid: string; region: string; queue: string };

export function progressAnswer(args: Args, signal: AbortSignal) {
  return {
    async *[Symbol.asyncIterator](): AsyncGenerator<
      SimpleProgressMsg,
      void,
      void
    > {
      const res = await $streamSimpleProgress({ data: args, signal });
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
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            yield value as T;
          }
        } finally {
          reader.releaseLock();
        }
      }

      for await (const line of streamToAsyncIterable(lines)) {
        try {
          const msg = JSON.parse(
            line as unknown as string
          ) as SimpleProgressMsg;

          console.log(msg);

          yield msg;
        } catch {}
      }
    },
  };
}
