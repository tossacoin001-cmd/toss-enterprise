export type HealthResult = { status: "ok" | "down"; ms: number };

/**
 * Runs a probe (a cheap database read) under a time limit. Any rejection or
 * timeout is "down"; the reason goes to `onError` for the server log and is
 * never part of the result, so the public endpoint leaks nothing about the
 * database. `ms` is how long the probe took: the route turns it into a
 * Server-Timing header, which shows how far the database is from the function.
 */
export async function checkHealth(
  probe: () => Promise<unknown>,
  options: { timeoutMs?: number; onError?: (error: unknown) => void } = {}
): Promise<HealthResult> {
  const timeoutMs = options.timeoutMs ?? 8000;
  const started = Date.now();
  const elapsed = () => Date.now() - started;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      probe(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("health probe timed out")), timeoutMs);
      }),
    ]);
    return { status: "ok", ms: elapsed() };
  } catch (error) {
    options.onError?.(error);
    return { status: "down", ms: elapsed() };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
