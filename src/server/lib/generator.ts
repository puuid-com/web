type AG<T, R> = AsyncGenerator<T, R, void>;

export function pipeStep<T, R>(gen: AG<T, R>) {
  let resolveResult!: (r: R) => void;
  const result = new Promise<R>((r) => (resolveResult = r));

  const stream = (async function* (): AsyncGenerator<T, void, void> {
    while (true) {
      const { value, done } = await gen.next();
      if (done) {
        resolveResult(value as R);
        return;
      }
      yield value as T;
    }
  })();

  return { stream, result };
}
