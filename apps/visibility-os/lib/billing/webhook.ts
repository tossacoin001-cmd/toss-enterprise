import { createHmac, timingSafeEqual } from "node:crypto";
import { isInterval, isPlanId, type Interval, type PlanId, type Price } from "./plans";
import { nextSubscription, type Sub } from "./subscription";

/**
 * Paystack payment events, kept free of the framework so they can be tested. Paystack signs the exact request
 * body with HMAC SHA512 using our secret key and sends it as `x-paystack-signature`. Checkout puts the buyer,
 * plan and interval in the transaction metadata and starts the reference with `vos_`. ADR-0021.
 */

export function verifySignature(rawBody: string, received: string | null | undefined, secret: string | undefined): boolean {
  if (!secret || !received) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type Charge = { eventId: string; userId: string; plan: PlanId; interval: Interval; amountMinor: number; currency: string; successful: boolean };

export function parseCharge(body: unknown): Charge | null {
  if (!body || typeof body !== "object") return null;
  const b = body as { event?: unknown; data?: Record<string, unknown> };
  if (b.event !== "charge.success" || !b.data || typeof b.data !== "object") return null;
  const d = b.data;
  if (typeof d.reference !== "string" || !d.reference.startsWith("vos_")) return null;
  if (typeof d.id !== "number" && typeof d.id !== "string") return null;
  if (typeof d.amount !== "number" || typeof d.currency !== "string") return null;
  const m = d.metadata && typeof d.metadata === "object" ? (d.metadata as Record<string, unknown>) : {};
  if (typeof m.userId !== "string" || m.userId.length === 0 || !isPlanId(m.plan) || !isInterval(m.interval)) return null;
  return { eventId: String(d.id), userId: m.userId, plan: m.plan, interval: m.interval, amountMinor: d.amount, currency: d.currency, successful: d.status === "success" };
}

export type Verdict = { ok: true } | { ok: false; reason: "no_price" | "not_successful" | "currency" | "amount" };

export function validateCharge(c: Charge, price: Price | null): Verdict {
  if (!c.successful) return { ok: false, reason: "not_successful" };
  if (!price) return { ok: false, reason: "no_price" };
  if (c.currency !== price.currency) return { ok: false, reason: "currency" };
  if (c.amountMinor !== price.amountMinor) return { ok: false, reason: "amount" };
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
export async function applyBillingEvent(db: BillingDb, body: unknown, priceFor: (plan: PlanId, interval: Interval) => Price | null, now: number): Promise<Outcome> {
  const charge = parseCharge(body);
  if (!charge) return "ignored";
  try {
    await db.billingEvent.create({ data: { provider: "paystack", eventId: charge.eventId, type: "charge.success" } });
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
  const verdict = validateCharge(charge, priceFor(charge.plan, charge.interval));
  if (!verdict.ok) return `rejected:${verdict.reason}`;
  const next = nextSubscription(prev, { type: "paid", plan: charge.plan, interval: charge.interval }, now);
  await db.subscription.upsert({ where: { userId: charge.userId }, create: { userId: charge.userId, ...next }, update: next });
  return "applied";
}
