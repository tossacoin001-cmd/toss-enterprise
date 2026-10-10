export type HealthResult = { status: "ok" | "down" };

/**
 * Runs a probe (a cheap database read) under a time limit. Any rejection or
 * timeout is "down"; the reason goes to `onError` for the server log and is
 * never part of the result, so the public endpoint leaks nothing about the
 * database.
 */
export async function checkHealth(
  probe: () => Promise<unknown>,
  options: { timeoutMs?: number; onError?: (error: unknown) => void } = {}
): Promise<HealthResult> {
  const timeoutMs = options.timeoutMs ?? 8000;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      probe(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("health probe timed out")), timeoutMs);
      }),
    ]);
    return { status: "ok" };
  } catch (error) {
    options.onError?.(error);
    return { status: "down" };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
