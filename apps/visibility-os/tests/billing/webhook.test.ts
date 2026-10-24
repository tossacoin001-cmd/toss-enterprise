import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { applyBillingEvent, parseCharge, validateCharge, verifySignature, type BillingDb } from "@/lib/billing/webhook";
import { PERIOD_DAYS, nextSubscription } from "@/lib/billing/subscription";
import { priceFor } from "@/lib/billing/plans";

// Paystack payment events. A payment only switches a plan on when the signature is right, the event has
// not been seen before, and the amount and currency match the price list exactly. ADR-0021.

const NOW = Date.UTC(2026, 10, 1, 12, 0, 0);
const DAY = 86_400_000;
const charge = (over: Record<string, unknown> = {}, meta: Record<string, unknown> = {}) => ({
  event: "charge.success",
  data: {
    id: 4401,
    reference: "vos_abc",
    status: "success",
    amount: 1_000_000,
    currency: "NGN",
    metadata: { userId: "user1", plan: "STARTER", interval: "MONTHLY", ...meta },
    ...over,
  },
});

describe("verifySignature", () => {
  const secret = "sk_test_secret";
  const body = JSON.stringify(charge());
  const good = createHmac("sha512", secret).update(body).digest("hex");
  it("accepts the right signature over the exact body", () => expect(verifySignature(body, good, secret)).toBe(true));
  it("rejects a changed body", () => expect(verifySignature(body + " ", good, secret)).toBe(false));
  it("rejects a wrong, empty or missing signature", () => {
    expect(verifySignature(body, "00", secret)).toBe(false);
    expect(verifySignature(body, "", secret)).toBe(false);
    expect(verifySignature(body, null, secret)).toBe(false);
  });
  it("rejects everything when no secret is set", () => {
    expect(verifySignature(body, good, undefined)).toBe(false);
    expect(verifySignature(body, good, "")).toBe(false);
  });
});

describe("parseCharge", () => {
  it("reads a successful payment", () => {
    expect(parseCharge(charge())).toEqual({ eventId: "4401", userId: "user1", plan: "STARTER", interval: "MONTHLY", amountMinor: 1_000_000, currency: "NGN", successful: true });
  });
  it("marks other statuses as not successful", () => expect(parseCharge(charge({ status: "failed" }))?.successful).toBe(false));
  it("returns null for other events, junk, a missing id or unknown plan or interval", () => {
    expect(parseCharge({ event: "transfer.success", data: {} })).toBeNull();
    expect(parseCharge(null)).toBeNull();
    expect(parseCharge("x")).toBeNull();
    expect(parseCharge(charge({ id: undefined }))).toBeNull();
    expect(parseCharge(charge({}, { plan: "PLATINUM" }))).toBeNull();
    expect(parseCharge(charge({}, { interval: "WEEKLY" }))).toBeNull();
    expect(parseCharge(charge({}, { userId: "" }))).toBeNull();
    expect(parseCharge(charge({ reference: "someone-elses" }))).toBeNull();
  });
});

describe("validateCharge", () => {
  const c = parseCharge(charge())!;
  const price = priceFor("STARTER", "MONTHLY");
  it("passes the exact price", () => expect(validateCharge(c, price)).toEqual({ ok: true }));
  it("fails a wrong amount, currency or status", () => {
    expect(validateCharge({ ...c, amountMinor: 999_999 }, price)).toEqual({ ok: false, reason: "amount" });
    expect(validateCharge({ ...c, currency: "USD" }, price)).toEqual({ ok: false, reason: "currency" });
    expect(validateCharge({ ...c, successful: false }, price)).toEqual({ ok: false, reason: "not_successful" });
  });
  it("a monthly payment cannot buy a year", () => {
    const year = parseCharge(charge({}, { interval: "ANNUAL" }))!;
    expect(validateCharge(year, priceFor("STARTER", "ANNUAL"))).toEqual({ ok: false, reason: "amount" });
  });
});

describe("nextSubscription", () => {
  it("a monthly payment gives 30 days, a yearly one 365", () => {
    expect(PERIOD_DAYS).toEqual({ MONTHLY: 30, ANNUAL: 365 });
    const m = nextSubscription(null, { type: "paid", plan: "STARTER", interval: "MONTHLY" }, NOW);
    const y = nextSubscription(null, { type: "paid", plan: "GROWTH", interval: "ANNUAL" }, NOW);
    expect(m).toMatchObject({ status: "active", plan: "STARTER", interval: "MONTHLY", cancelAtPeriodEnd: false });
    expect(m.currentPeriodEnd.getTime()).toBe(NOW + 30 * DAY);
    expect(y.currentPeriodEnd.getTime()).toBe(NOW + 365 * DAY);
  });
  it("paying again early adds to the end instead of losing days", () => {
    const first = nextSubscription(null, { type: "paid", plan: "STARTER", interval: "MONTHLY" }, NOW);
    const second = nextSubscription(first, { type: "paid", plan: "STARTER", interval: "MONTHLY" }, NOW + DAY);
    expect(second.currentPeriodEnd.getTime()).toBe(first.currentPeriodEnd.getTime() + 30 * DAY);
  });
  it("moving to a higher plan keeps the days already paid for", () => {
    const first = nextSubscription(null, { type: "paid", plan: "STARTER", interval: "MONTHLY" }, NOW);
    const up = nextSubscription(first, { type: "paid", plan: "GROWTH", interval: "MONTHLY" }, NOW + 5 * DAY);
    expect(up.plan).toBe("GROWTH");
    expect(up.currentPeriodEnd.getTime()).toBe(first.currentPeriodEnd.getTime() + 30 * DAY);
  });
  it("a failed charge on an active subscription makes it past due without ending it", () => {
    const first = nextSubscription(null, { type: "paid", plan: "STARTER", interval: "MONTHLY" }, NOW);
    const s = nextSubscription(first, { type: "failed" }, NOW);
    expect(s.status).toBe("past_due");
    expect(s.currentPeriodEnd).toEqual(first.currentPeriodEnd);
  });
  it("cancel keeps access to the period end, and a new payment renews", () => {
    const first = nextSubscription(null, { type: "paid", plan: "STARTER", interval: "MONTHLY" }, NOW);
    const c = nextSubscription(first, { type: "cancel" }, NOW);
    expect(c).toMatchObject({ status: "active", cancelAtPeriodEnd: true });
    expect(nextSubscription(c, { type: "paid", plan: "STARTER", interval: "MONTHLY" }, NOW).cancelAtPeriodEnd).toBe(false);
  });
});

describe("applyBillingEvent", () => {
  const make = () => {
    const seen = new Set<string>();
    return {
      billingEvent: {
        create: vi.fn(async (a: { data: { provider: string; eventId: string } }) => {
          const k = `${a.data.provider}:${a.data.eventId}`;
          if (seen.has(k)) throw Object.assign(new Error("dup"), { code: "P2002" });
          seen.add(k);
          return a.data;
        }),
      },
      subscription: { findUnique: vi.fn(async (_a: unknown) => null), upsert: vi.fn(async (_a: unknown) => ({})) },
    };
  };
  const run = (db: ReturnType<typeof make>, body: unknown) => applyBillingEvent(db as unknown as BillingDb, body, priceFor, NOW);

  it("records the event and switches the plan on", async () => {
    const db = make();
    expect(await run(db, charge())).toBe("applied");
    const arg = db.subscription.upsert.mock.calls[0][0] as { create: Record<string, unknown> };
    expect(arg.create).toMatchObject({ userId: "user1", plan: "STARTER", interval: "MONTHLY", status: "active" });
    expect(db.billingEvent.create).toHaveBeenCalledWith({ data: { provider: "paystack", eventId: "4401", type: "charge.success" } });
  });
  it("ignores a repeat delivery of the same event", async () => {
    const db = make();
    await run(db, charge());
    expect(await run(db, charge())).toBe("duplicate");
    expect(db.subscription.upsert).toHaveBeenCalledTimes(1);
  });
  it("does not switch anything on for the wrong amount, and says why", async () => {
    const db = make();
    expect(await run(db, charge({ amount: 100 }))).toBe("rejected:amount");
    expect(db.subscription.upsert).not.toHaveBeenCalled();
  });
  it("accepts the yearly price for a yearly purchase", async () => {
    const db = make();
    expect(await run(db, charge({ amount: 10_000_000 }, { interval: "ANNUAL" }))).toBe("applied");
  });
  it("ignores events it does not understand", async () => {
    const db = make();
    expect(await run(db, { event: "x" })).toBe("ignored");
    expect(db.billingEvent.create).not.toHaveBeenCalled();
  });
  it("a failed payment for an existing subscriber makes it past due", async () => {
    const db = make();
    db.subscription.findUnique.mockResolvedValue({ plan: "STARTER", interval: "MONTHLY", status: "active", currentPeriodEnd: new Date(NOW + DAY), cancelAtPeriodEnd: false } as never);
    expect(await run(db, charge({ status: "failed" }))).toBe("applied");
    expect(db.subscription.upsert.mock.calls[0][0]).toMatchObject({ update: { status: "past_due" } });
  });
});
