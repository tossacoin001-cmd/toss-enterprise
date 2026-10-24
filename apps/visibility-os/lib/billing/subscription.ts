import type { PlanId } from "./plans";

/** The subscription lifecycle as a pure step function. Access wording lives in entitlements.ts. */
export type Sub = { plan: PlanId; status: "pending" | "active" | "past_due" | "ended"; currentPeriodEnd: Date; cancelAtPeriodEnd: boolean };
export type Signal = { type: "paid"; plan: PlanId } | { type: "failed" } | { type: "cancel" };

export const PERIOD_MS = 30 * 86_400_000;

export function nextSubscription(prev: Sub | null, signal: Signal, now: number): Sub {
  if (signal.type === "paid") {
    const base = prev && prev.currentPeriodEnd.getTime() > now ? prev.currentPeriodEnd.getTime() : now;
    return { plan: signal.plan, status: "active", currentPeriodEnd: new Date(base + PERIOD_MS), cancelAtPeriodEnd: false };
  }
  if (!prev) return { plan: "STARTER", status: "pending", currentPeriodEnd: new Date(now), cancelAtPeriodEnd: false };
  if (signal.type === "failed") return { ...prev, status: prev.status === "active" ? "past_due" : prev.status };
  return { ...prev, cancelAtPeriodEnd: true };
}
