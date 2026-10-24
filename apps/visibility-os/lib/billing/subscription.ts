import type { Interval, PlanId } from "./plans";

/** The subscription lifecycle as a pure step function. Access wording lives in entitlements.ts. */
export type Sub = { plan: PlanId; interval: Interval; status: "pending" | "active" | "past_due" | "ended"; currentPeriodEnd: Date; cancelAtPeriodEnd: boolean };
export type Signal = { type: "paid"; plan: PlanId; interval: Interval } | { type: "failed" } | { type: "cancel" };

export const PERIOD_DAYS: Record<Interval, number> = { MONTHLY: 30, ANNUAL: 365 };
const DAY = 86_400_000;

export function nextSubscription(prev: Sub | null, signal: Signal, now: number): Sub {
  if (signal.type === "paid") {
    // Paying early or moving up adds to the days already paid for; nothing is lost.
    const base = prev && prev.status !== "ended" && prev.currentPeriodEnd.getTime() > now ? prev.currentPeriodEnd.getTime() : now;
    return { plan: signal.plan, interval: signal.interval, status: "active", currentPeriodEnd: new Date(base + PERIOD_DAYS[signal.interval] * DAY), cancelAtPeriodEnd: false };
  }
  if (!prev) return { plan: "STARTER", interval: "MONTHLY", status: "pending", currentPeriodEnd: new Date(now), cancelAtPeriodEnd: false };
  if (signal.type === "failed") return { ...prev, status: prev.status === "active" ? "past_due" : prev.status };
  return { ...prev, cancelAtPeriodEnd: true };
}
