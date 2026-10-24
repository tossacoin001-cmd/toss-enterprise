/**
 * Time-boxed weekly run. The cron is invoked daily; each run takes the users
 * whose last weekly run is 6+ days old (never-run users once they are 6+ days
 * old, so the first email lands at the end of the 7-day trial, not the day
 * after sign-up), oldest first, and works until the time budget is spent.
 * Whatever is left is picked up by tomorrow's run, so a growing user base
 * degrades into "a day late", never into a timed-out job that emails nobody.
 * Replaces the single Monday run that scored every business in one go and
 * hit Vercel's 60s limit at around ten businesses (ADR-0010 update).
 * Pure orchestration: all I/O is injected so the rules are unit-testable.
 */

export const WEEKLY_INTERVAL_MS = 6 * 24 * 60 * 60 * 1000;
/** Stop starting new work after this; a started user can still take ~15s. */
export const TIME_BUDGET_MS = 35_000;
export const USER_CONCURRENCY = 3;

export type UserOutcome = "sent" | "skipped_no_email" | "skipped_opted_out" | "failed";

export type RunDeps<U extends { id: string }> = {
  /** Users due for a run, oldest first, never including `excludeIds`. */
  findDueUsers(limit: number, excludeIds: string[]): Promise<U[]>;
  processUser(user: U): Promise<UserOutcome>;
  /** Takes a short lease on a user so overlapping runs cannot both email them. Omitted means no leasing. */
  claim?(user: U): Promise<boolean>;
  release?(user: U): Promise<void>;
  now(): number;
};

export type RunSummary = {
  usersProcessed: number;
  emailsSent: number;
  skippedNoEmail: number;
  skippedOptedOut: number;
  /** Users another run was already working on. */
  skippedClaimed: number;
  failed: number;
  /** True when the budget ran out while users were still due. */
  budgetExhausted: boolean;
};

export async function runWeekly<U extends { id: string }>(
  deps: RunDeps<U>,
  options: { budgetMs?: number; concurrency?: number } = {}
): Promise<RunSummary> {
  const budgetMs = options.budgetMs ?? TIME_BUDGET_MS;
  const concurrency = options.concurrency ?? USER_CONCURRENCY;
  const startedAt = deps.now();

  const summary: RunSummary = {
    usersProcessed: 0,
    emailsSent: 0,
    skippedNoEmail: 0,
    skippedOptedOut: 0,
    skippedClaimed: 0,
    failed: 0,
    budgetExhausted: false,
  };
  // A failed user stays "due" in the database; without this they would be
  // picked up again immediately and loop until the budget ran out.
  const failedThisRun: string[] = [];

  for (;;) {
    if (deps.now() - startedAt >= budgetMs) {
      const remaining = await deps.findDueUsers(1, failedThisRun);
      summary.budgetExhausted = remaining.length > 0;
      break;
    }

    const batch = await deps.findDueUsers(concurrency, failedThisRun);
    if (batch.length === 0) break;

    const outcomes = await Promise.all(
      batch.map(async (user): Promise<[string, UserOutcome | "claimed_elsewhere"]> => {
        if (deps.claim && !(await deps.claim(user))) return [user.id, "claimed_elsewhere"];
        try {
          return [user.id, await deps.processUser(user)];
        } catch (e) {
          console.error("[weekly-run] user failed", user.id, e);
          return [user.id, "failed"];
        } finally {
          await deps.release?.(user).catch(() => undefined);
        }
      })
    );

    for (const [id, outcome] of outcomes) {
      if (outcome === "claimed_elsewhere") {
        summary.skippedClaimed += 1;
        failedThisRun.push(id);
        continue;
      }
      summary.usersProcessed += 1;
      if (outcome === "sent") summary.emailsSent += 1;
      else if (outcome === "skipped_no_email") summary.skippedNoEmail += 1;
      else if (outcome === "skipped_opted_out") summary.skippedOptedOut += 1;
      else {
        summary.failed += 1;
        failedThisRun.push(id);
      }
    }
  }

  return summary;
}
