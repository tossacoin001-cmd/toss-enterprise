import "server-only";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isInterval, isPlanId } from "./plans";
import { accessFor, guardGoogle, guardMutation, startTrialIfNeeded, type Access, type SubscriptionFacts, type TrialDb } from "./entitlements";

/** Holds changes back after the trial only when this is "on". Paid plans are not on sale yet, so it starts off. */
export const trialEnforced = (): boolean => process.env.TRIAL_ENFORCEMENT === "on";

/** The signed-in user's access now. Starts the trial the first time, once. */
export async function getAccess(userId: string, now: number = Date.now()): Promise<Access> {
  const trial = await startTrialIfNeeded(db as unknown as TrialDb, userId, now);
  const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true } }).catch(() => null);
  const sub = await db.subscription.findUnique({ where: { userId } }).catch(() => null);
  const subscription = sub && isPlanId(sub.plan) ? { plan: sub.plan, interval: isInterval(sub.interval) ? sub.interval : ("MONTHLY" as const), status: sub.status as SubscriptionFacts["status"], currentPeriodEnd: sub.currentPeriodEnd, cancelAtPeriodEnd: sub.cancelAtPeriodEnd } : null;
  return accessFor({ plan: user?.plan ?? "FREE", trialStartedAt: trial.trialStartedAt, trialEndsAt: trial.trialEndsAt, subscription }, now);
}

/** For routes that change something: null when allowed, or the 403 answer to send back. */
export async function requireMutationAccess(userId: string): Promise<NextResponse | null> {
  const guard = guardMutation(await getAccess(userId), trialEnforced());
  return guard.ok ? null : NextResponse.json({ error: guard.error }, { status: guard.status });
}

/** For the route that connects a Google listing: null when allowed, or the 403 answer to send back. */
export async function requireGoogleAccess(userId: string): Promise<NextResponse | null> {
  const guard = guardGoogle(await getAccess(userId), trialEnforced());
  return guard.ok ? null : NextResponse.json({ error: guard.error }, { status: guard.status });
}
