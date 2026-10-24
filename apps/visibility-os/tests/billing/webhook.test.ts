import { describe, expect, it, vi } from "vitest";
import { applyBillingEvent, parseCharge, validateCharge, verifyHash, type BillingDb } from "@/lib/billing/webhook";
import { checkoutAvailable, planPrice, PLANS } from "@/lib/billing/plans";
import { nextSubscription } from "@/lib/billing/subscription";

// Billing building blocks only. Checkout stays unavailable until prices and the provider are confirmed
// (handoff 5C). Event shape follows Flutterwave's charge.completed webhook; unverified against live traffic.

const NOW = Date.UTC(2026, 9, 23, 12, 0, 0);
const payload = (over: Record<string, unknown> = {}) => ({
  event: "charge.completed",
  data: { id: 98765, tx_ref: "vos.user1.STARTER.n1", amount: 5000, currency: "NGN", status: "successful", ...over },
});

describe("verifyHash", () => {
  it("accepts the exact secret", () => expect(verifyHash("s3cret-hash", "s3cret-hash")).toBe(true));
  it("rejects a wrong, empty or missing value", () => {
    expect(verifyHash("nope", "s3cret-hash")).toBe(false);
    expect(verifyHash("", "s3cret-hash")).toBe(false);
    expect(verifyHash(null, "s3cret-hash")).toBe(false);
  });
  it("rejects everything when no secret is configured", () => {
    expect(verifyHash("", "")).toBe(false);
    expect(verifyHash("x", undefined)).toBe(false);
  });
});

describe("parseCharge", () => {
  it("reads a successful charge", () => {
    expect(parseCharge(payload())).toEqual({ eventId: "98765", userId: "user1", plan: "STARTER", amount: 5000, currency: "NGN", successful: true });
  });
  it("marks a failed charge as not successful", () => expect(parseCharge(payload({ status: "failed" }))?.successful).toBe(false));
  it("returns null for other events, junk and unknown references", () => {
    expect(parseCharge({ event: "transfer.completed", data: {} })).toBeNull();
    expect(parseCharge(null)).toBeNull();
    expect(parseCharge("x")).toBeNull();
    expect(parseCharge(payload({ tx_ref: "random" }))).toBeNull();
    expect(parseCharge(payload({ tx_ref: "vos.user1.PLATINUM.n1" }))).toBeNull();
    expect(parseCharge(payload({ id: undefined }))).toBeNull();
  });
});

describe("plans", () => {
  it("has no confirmed prices yet, so checkout is unavailable", () => {
    for (const p of Object.values(PLANS)) expect(p.amount).toBeNull();
    expect(checkoutAvailable({ webhookHash: "set" })).toBe(false);
  });
  it("is available only with both a price for every sold plan and the webhook secret", () => {
    const priced = { STARTER: { amount: 5000, currency: "NGN" } };
    expect(checkoutAvailable({ webhookHash: "set", prices: priced })).toBe(true);
    expect(checkoutAvailable({ webhookHash: "", prices: priced })).toBe(false);
  });
  it("planPrice is null for an unpriced plan", () => expect(planPrice("STARTER")).toBeNull());
});

describe("validateCharge", () => {
  const charge = parseCharge(payload())!;
  const price = { amount: 5000, currency: "NGN" };
  it("passes an exact match", () => expect(validateCharge(charge, price)).toEqual({ ok: true }));
  it("fails a wrong amount, currency or unsuccessful status", () => {
    expect(validateCharge({ ...charge, amount: 4999 }, price)).toEqual({ ok: false, reason: "amount" });
    expect(validateCharge({ ...charge, currency: "USD" }, price)).toEqual({ ok: false, reason: "currency" });
    expect(validateCharge({ ...charge, successful: false }, price)).toEqual({ ok: false, reason: "not_successful" });
  });
  it("fails when the plan has no confirmed price", () => expect(validateCharge(charge, null)).toEqual({ ok: false, reason: "no_price" }));
});

describe("nextSubscription", () => {
  const period = 30 * 86_400_000;
  it("a validated payment makes an active subscription for one period", () => {
    const s = nextSubscription(null, { type: "paid", plan: "STARTER" }, NOW);
    expect(s).toMatchObject({ status: "active", plan: "STARTER", cancelAtPeriodEnd: false });
    expect(s.currentPeriodEnd.getTime()).toBe(NOW + period);
  });
  it("a second payment extends from the later of now and the current end", () => {
    const first = nextSubscription(null, { type: "paid", plan: "STARTER" }, NOW);
    const second = nextSubscription(first, { type: "paid", plan: "STARTER" }, NOW + 86_400_000);
    expect(second.currentPeriodEnd.getTime()).toBe(first.currentPeriodEnd.getTime() + period);
  });
  it("a failed charge on an active subscription makes it past due without ending it", () => {
    const first = nextSubscription(null, { type: "paid", plan: "STARTER" }, NOW);
    const s = nextSubscription(first, { type: "failed" }, NOW);
    expect(s.status).toBe("past_due");
    expect(s.currentPeriodEnd).toEqual(first.currentPeriodEnd);
  });
  it("a failed first charge leaves nothing active", () => expect(nextSubscription(null, { type: "failed" }, NOW).status).toBe("pending"));
  it("cancel keeps access to the period end", () => {
    const first = nextSubscription(null, { type: "paid", plan: "STARTER" }, NOW);
    const s = nextSubscription(first, { type: "cancel" }, NOW);
    expect(s).toMatchObject({ status: "active", cancelAtPeriodEnd: true });
  });
  it("a payment after cancelling renews it", () => {
    const first = nextSubscription(null, { type: "paid", plan: "STARTER" }, NOW);
    const cancelled = nextSubscription(first, { type: "cancel" }, NOW);
    expect(nextSubscription(cancelled, { type: "paid", plan: "STARTER" }, NOW).cancelAtPeriodEnd).toBe(false);
  });
});

describe("applyBillingEvent", () => {
  const make = () => {
    const seen = new Set<string>();
    const db = {
      billingEvent: {
        create: vi.fn(async (a: { data: { provider: string; eventId: string } }) => {
          const k = `${a.data.provider}:${a.data.eventId}`;
          if (seen.has(k)) throw Object.assign(new Error("dup"), { code: "P2002" });
          seen.add(k);
          return a.data;
        }),
      },
      subscription: { findUnique: vi.fn(async () => null), upsert: vi.fn(async (_a: unknown) => ({})) },
    };
    return db;
  };
  const price = { amount: 5000, currency: "NGN" };

  it("records the event and activates the subscription", async () => {
    const db = make();
    const r = await applyBillingEvent(db as unknown as BillingDb, payload(), () => price, NOW);
    expect(r).toBe("applied");
    expect(db.subscription.upsert).toHaveBeenCalledTimes(1);
  });
  it("ignores a repeat delivery of the same event", async () => {
    const db = make();
    await applyBillingEvent(db as unknown as BillingDb, payload(), () => price, NOW);
    expect(await applyBillingEvent(db as unknown as BillingDb, payload(), () => price, NOW)).toBe("duplicate");
    expect(db.subscription.upsert).toHaveBeenCalledTimes(1);
  });
  it("does not activate on a wrong amount, and says why", async () => {
    const db = make();
    expect(await applyBillingEvent(db as unknown as BillingDb, payload({ amount: 1 }), () => price, NOW)).toBe("rejected:amount");
    expect(db.subscription.upsert).not.toHaveBeenCalled();
  });
  it("does not activate when no price is confirmed", async () => {
    const db = make();
    expect(await applyBillingEvent(db as unknown as BillingDb, payload(), () => null, NOW)).toBe("rejected:no_price");
    expect(db.subscription.upsert).not.toHaveBeenCalled();
  });
  it("ignores events it does not understand", async () => {
    const db = make();
    expect(await applyBillingEvent(db as unknown as BillingDb, { event: "x" }, () => price, NOW)).toBe("ignored");
    expect(db.billingEvent.create).not.toHaveBeenCalled();
  });
  it("a failed charge makes an existing subscription past due", async () => {
    const db = make();
    db.subscription.findUnique.mockResolvedValue({ plan: "STARTER", status: "active", currentPeriodEnd: new Date(NOW + 86_400_000), cancelAtPeriodEnd: false } as never);
    expect(await applyBillingEvent(db as unknown as BillingDb, payload({ status: "failed" }), () => price, NOW)).toBe("applied");
    expect(db.subscription.upsert.mock.calls[0][0]).toMatchObject({ update: { status: "past_due" } });
  });
});
