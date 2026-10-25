import { dateText } from "@/lib/workspace/history";
import { BUSINESS_LIMIT } from "./policy";
import { PLANS, type Interval, type PlanId } from "./plans";

/**
 * What an account may do, in one place. The seven-day workspace trial starts once, needs no card and is
 * separate from the free public check. After it ends, data stays readable and downloadable; only changes
 * are held back, and only when enforcement is switched on. Paid states are here so billing can be switched
 * on without redesigning access. Tests: tests/billing/entitlements.test.ts.
 */

export const TRIAL_DAYS = 7;
const DAY = 86_400_000;

export type SubscriptionFacts = { plan: PlanId; interval: Interval; status: "pending" | "active" | "past_due" | "ended"; currentPeriodEnd: Date; cancelAtPeriodEnd: boolean };

export type AccessFacts = {
  plan: string;
  trialStartedAt: Date | null;
  trialEndsAt: Date | null;
  subscription: SubscriptionFacts | null;
};

export type AccessState =
  | "trial_not_started"
  | "trial_active"
  | "trial_ended"
  | "paid_active"
  | "payment_pending"
  | "past_due"
  | "cancelled_at_period_end"
  | "expired";

export type Access = {
  state: AccessState;
  label: string;
  detail: string;
  daysLeft: number | null;
  endsAt: Date | null;
  endsText: string | null;
  canUse: boolean;
  canMutate: boolean;
  canExport: boolean;
  businessLimit: number;
  /** May connect a Google listing. Starts in the Growth package; the trial has it. */
  google: boolean;
  /** Has a live paid package (not a trial). */
  paid: boolean;
};

const plural = (n: number) => `${n} day${n === 1 ? "" : "s"}`;

export function accessFor(f: AccessFacts, now: number): Access {
  const base = { canUse: true, canExport: true, businessLimit: BUSINESS_LIMIT, google: false, paid: false, endsAt: f.trialEndsAt, endsText: f.trialEndsAt ? dateText(f.trialEndsAt) : null, daysLeft: null as number | null };
  const trialActive = f.trialEndsAt !== null && now < f.trialEndsAt.getTime();
  const trialNotStarted = f.trialStartedAt === null || f.trialEndsAt === null;
  const trialDays = f.trialEndsAt ? Math.min(TRIAL_DAYS, Math.max(0, Math.ceil((f.trialEndsAt.getTime() - now) / DAY))) : null;

  const sub = f.subscription;
  if (sub) {
    const until = dateText(sub.currentPeriodEnd);
    const pkg = PLANS[sub.plan];
    const owned = { businessLimit: pkg.businessLimit, google: pkg.google, paid: true, endsAt: sub.currentPeriodEnd, endsText: until };
    const open = now < sub.currentPeriodEnd.getTime();
    if (sub.status === "active" && !sub.cancelAtPeriodEnd && open) {
      return { ...base, ...owned, state: "paid_active", label: `${pkg.name} package`, detail: `Your package runs until ${until}. Pay again before then to keep it.`, canMutate: true };
    }
    if (sub.status === "active" && sub.cancelAtPeriodEnd && open) {
      return { ...base, ...owned, state: "cancelled_at_period_end", label: "Package ending", detail: `You will not be charged again. You keep full access until ${until}.`, canMutate: true };
    }
    if (sub.status === "active") {
      return { ...base, businessLimit: pkg.businessLimit, state: "expired", label: "Package ended", detail: `Your ${pkg.name} package ended on ${until}. You can still see and download your data.`, canMutate: false, endsAt: sub.currentPeriodEnd, endsText: until };
    }
    if (sub.status === "past_due") {
      return { ...base, ...owned, state: "past_due", label: "Payment needed", detail: "We could not take your last payment. Nothing has been switched off. Please pay again.", canMutate: true };
    }
    if (sub.status === "pending") {
      return { ...base, google: trialNotStarted || trialActive, state: "payment_pending", label: "Payment pending", detail: "We are waiting for your payment to be confirmed. Until then, your trial rules apply.", canMutate: trialNotStarted || trialActive, daysLeft: trialDays };
    }
    return { ...base, state: "expired", label: "Package ended", detail: "Your package has ended. You can still see and download your data.", canMutate: false };
  }

  if (trialNotStarted) {
    return { ...base, google: true, state: "trial_not_started", label: "Free trial", detail: `Your ${TRIAL_DAYS}-day free trial starts the first time you use your workspace. No payment is needed.`, canMutate: true, endsAt: null, endsText: null };
  }
  if (trialActive) {
    return { ...base, google: true, state: "trial_active", label: `Free trial: ${plural(trialDays ?? 0)} left`, detail: `Your free trial ends on ${base.endsText}. No payment is needed.`, canMutate: true, daysLeft: trialDays };
  }
  return { ...base, state: "trial_ended", label: "Free trial ended", detail: `Your free trial ended on ${base.endsText}. You can still see and download your data.`, canMutate: false, daysLeft: 0 };
}

export type Guard = { ok: true } | { ok: false; status: 403; error: string };

/** The server's answer to "may this account make a change?". Held back only when enforcement is on. */
export function guardMutation(access: Access, enforced: boolean): Guard {
  if (!enforced || access.canMutate) return { ok: true };
  return { ok: false, status: 403, error: `Your free trial ended on ${access.endsText ?? "an earlier date"}, so changes are paused. You can still see your data and download it.` };
}

/** Connecting Google starts in the Growth package. A paid Starter is always told; others only once pausing is on. */
export function guardGoogle(access: Access, enforced: boolean): Guard {
  if (access.google) return { ok: true };
  if (!enforced && !access.paid) return { ok: true };
  const error = access.paid ? "Connecting your Google listing is part of the Growth package. You can move up from the plans page." : `Your free trial ended on ${access.endsText ?? "an earlier date"}, so changes are paused. You can still see your data and download it.`;
  return { ok: false, status: 403, error };
}

export interface TrialDb {
  user: {
    updateMany(args: { where: { id: string; trialStartedAt: null }; data: { trialStartedAt: Date; trialEndsAt: Date } }): Promise<{ count: number }>;
    findUnique(args: { where: { id: string } }): Promise<{ trialStartedAt: Date | null; trialEndsAt: Date | null } | null>;
  };
}

/** Starts the trial the first time it is needed. One conditional update, so it can never restart or double-start. */
export async function startTrialIfNeeded(db: TrialDb, userId: string, now: number): Promise<{ trialStartedAt: Date | null; trialEndsAt: Date | null }> {
  await db.user.updateMany({
    where: { id: userId, trialStartedAt: null },
    data: { trialStartedAt: new Date(now), trialEndsAt: new Date(now + TRIAL_DAYS * DAY) },
  });
  const row = await db.user.findUnique({ where: { id: userId } });
  return { trialStartedAt: row?.trialStartedAt ?? null, trialEndsAt: row?.trialEndsAt ?? null };
}
