import type { RunSummary } from "./weekly-run";

/**
 * Claim-before-send for the weekly run, and a durable record of each run. A claim is a short lease: one
 * conditional update decides who works on a user, so two overlapping runs cannot both email them.
 * A crashed run's lease expires by itself.
 */
export const CLAIM_LEASE_MS = 15 * 60 * 1000;

export interface ClaimDb {
  user: {
    updateMany(args: {
      where: { id: string; OR?: Array<{ weeklyClaimAt: null } | { weeklyClaimAt: { lt: Date } }> };
      data: { weeklyClaimAt: Date | null };
    }): Promise<{ count: number }>;
  };
}

export async function claimUser(db: ClaimDb, userId: string, now: number): Promise<boolean> {
  const r = await db.user.updateMany({
    where: { id: userId, OR: [{ weeklyClaimAt: null }, { weeklyClaimAt: { lt: new Date(now - CLAIM_LEASE_MS) } }] },
    data: { weeklyClaimAt: new Date(now) },
  });
  return r.count === 1;
}

export async function releaseUser(db: ClaimDb, userId: string): Promise<void> {
  await db.user.updateMany({ where: { id: userId }, data: { weeklyClaimAt: null } });
}

export interface RunRecordDb {
  weeklyRun: {
    create(args: { data: { startedAt: Date } }): Promise<{ id: string }>;
    update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<unknown>;
  };
}

/** Records are best effort: a failure to write one must never stop the run. */
export async function startRun(db: RunRecordDb, now: number): Promise<string | null> {
  try {
    return (await db.weeklyRun.create({ data: { startedAt: new Date(now) } })).id;
  } catch {
    return null;
  }
}

export async function finishRun(db: RunRecordDb, id: string | null, now: number, s: RunSummary): Promise<void> {
  if (!id) return;
  try {
    await db.weeklyRun.update({
      where: { id },
      data: {
        finishedAt: new Date(now),
        usersProcessed: s.usersProcessed,
        emailsSent: s.emailsSent,
        skippedNoEmail: s.skippedNoEmail,
        skippedOptedOut: s.skippedOptedOut,
        skippedClaimed: s.skippedClaimed,
        failed: s.failed,
        budgetExhausted: s.budgetExhausted,
      },
    });
  } catch {
    // The run itself succeeded; only its record was lost.
  }
}
