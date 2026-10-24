import { timingSafeEqual } from "node:crypto";
import { isPlanId, type PlanId, type Price } from "./plans";
import { nextSubscription, type Sub } from "./subscription";

/**
 * Flutterwave webhook handling, kept free of the framework so it can be tested. The header `verif-hash`
 * must equal the secret hash we set in the dashboard. Our own payment reference is `vos.<userId>.<PLAN>.<nonce>`.
 * Written from the provider's documented charge.completed shape; not yet exercised by live traffic.
 */

export function verifyHash(received: string | null | undefined, secret: string | undefined): boolean {
  if (!secret || !received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type Charge = { eventId: string; userId: string; plan: PlanId; amount: number; currency: string; successful: boolean };

export function parseCharge(body: unknown): Charge | null {
  if (!body || typeof body !== "object") return null;
  const b = body as { event?: unknown; data?: Record<string, unknown> };
  if (b.event !== "charge.completed" || !b.data || typeof b.data !== "object") return null;
  const d = b.data;
  const ref = typeof d.tx_ref === "string" ? d.tx_ref.split(".") : [];
  if (ref.length < 4 || ref[0] !== "vos" || !ref[1] || !isPlanId(ref[2])) return null;
  if (typeof d.id !== "number" && typeof d.id !== "string") return null;
  if (typeof d.amount !== "number" || typeof d.currency !== "string") return null;
  return { eventId: String(d.id), userId: ref[1], plan: ref[2], amount: d.amount, currency: d.currency, successful: d.status === "successful" };
}

export type Verdict = { ok: true } | { ok: false; reason: "no_price" | "not_successful" | "currency" | "amount" };

export function validateCharge(c: Charge, price: Price | null): Verdict {
  if (!c.successful) return { ok: false, reason: "not_successful" };
  if (!price) return { ok: false, reason: "no_price" };
  if (c.currency !== price.currency) return { ok: false, reason: "currency" };
  if (c.amount !== price.amount) return { ok: false, reason: "amount" };
  return { ok: true };
}

export interface BillingDb {
  billingEvent: { create(args: { data: { provider: string; eventId: string; type: string } }): Promise<unknown> };
  subscription: {
    findUnique(args: { where: { userId: string } }): Promise<Sub | null>;
    upsert(args: { where: { userId: string }; create: Sub & { userId: string }; update: Sub }): Promise<unknown>;
  };
}

export type Outcome = "applied" | "duplicate" | "ignored" | `rejected:${string}`;

/** Records the event once (provider + id is unique), then moves the subscription. Repeats change nothing. */
export async function applyBillingEvent(db: BillingDb, body: unknown, priceFor: (plan: PlanId) => Price | null, now: number): Promise<Outcome> {
  const charge = parseCharge(body);
  if (!charge) return "ignored";
  try {
    await db.billingEvent.create({ data: { provider: "flutterwave", eventId: charge.eventId, type: "charge.completed" } });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") return "duplicate";
    throw e;
  }
  const prev = await db.subscription.findUnique({ where: { userId: charge.userId } });
  if (!charge.successful) {
    if (!prev) return "applied";
    const next = nextSubscription(prev, { type: "failed" }, now);
    await db.subscription.upsert({ where: { userId: charge.userId }, create: { userId: charge.userId, ...next }, update: next });
    return "applied";
  }
  const verdict = validateCharge(charge, priceFor(charge.plan));
  if (!verdict.ok) return `rejected:${verdict.reason}`;
  const next = nextSubscription(prev, { type: "paid", plan: charge.plan }, now);
  await db.subscription.upsert({ where: { userId: charge.userId }, create: { userId: charge.userId, ...next }, update: next });
  return "applied";
}
