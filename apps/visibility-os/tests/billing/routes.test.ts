import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The payment webhook is closed until configured and rejects anything unsigned. Checkout builds the amount
// on the server from the price list and never trusts the browser. ADR-0021.

const auth = vi.fn();
const currentUser = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({ auth: () => auth(), currentUser: () => currentUser() }));
const db = {
  billingEvent: { create: vi.fn(async (_a: unknown) => ({})) },
  subscription: { findUnique: vi.fn(async (_a: unknown) => null), upsert: vi.fn(async (_a: unknown) => ({})) },
};
vi.mock("@/lib/db", () => ({ db }));

const hook = await import("@/app/api/webhooks/paystack/route");
const checkout = await import("@/app/api/billing/checkout/route");

const SECRET = "sk_test_unit";
const bodyOf = (amount = 1_000_000) =>
  JSON.stringify({ event: "charge.success", data: { id: 77, reference: "vos_x", status: "success", amount, currency: "NGN", metadata: { userId: "u1", plan: "STARTER", interval: "MONTHLY" } } });
const sign = (b: string, secret = SECRET) => createHmac("sha512", secret).update(b).digest("hex");
const hookCall = (b: string, sig?: string) => hook.POST(new Request("http://x/api/webhooks/paystack", { method: "POST", body: b, headers: sig ? { "x-paystack-signature": sig } : {} }));

beforeEach(() => vi.clearAllMocks());
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("paystack webhook", () => {
  it("is off (503) while no key is set, and writes nothing", async () => {
    vi.stubEnv("PAYSTACK_SECRET_KEY", "");
    const b = bodyOf();
    expect((await hookCall(b, sign(b))).status).toBe(503);
    expect(db.billingEvent.create).not.toHaveBeenCalled();
  });
  it("refuses a missing or wrong signature with 401 and writes nothing", async () => {
    vi.stubEnv("PAYSTACK_SECRET_KEY", SECRET);
    const b = bodyOf();
    expect((await hookCall(b)).status).toBe(401);
    expect((await hookCall(b, sign(b, "other"))).status).toBe(401);
    expect(db.billingEvent.create).not.toHaveBeenCalled();
  });
  it("switches the plan on for a signed payment of exactly N10,000", async () => {
    vi.stubEnv("PAYSTACK_SECRET_KEY", SECRET);
    const b = bodyOf(1_000_000);
    const res = await hookCall(b, sign(b));
    expect(res.status).toBe(200);
    expect((await res.json()).outcome).toBe("applied");
    expect(db.subscription.upsert).toHaveBeenCalledTimes(1);
  });
  it("does not switch it on for a signed payment of the wrong amount", async () => {
    vi.stubEnv("PAYSTACK_SECRET_KEY", SECRET);
    const b = bodyOf(500_000);
    expect((await (await hookCall(b, sign(b))).json()).outcome).toBe("rejected:amount");
    expect(db.subscription.upsert).not.toHaveBeenCalled();
  });
  it("answers 200 for a repeat so Paystack stops retrying, without a second change", async () => {
    vi.stubEnv("PAYSTACK_SECRET_KEY", SECRET);
    db.billingEvent.create.mockRejectedValueOnce(Object.assign(new Error("dup"), { code: "P2002" }));
    const b = bodyOf();
    const res = await hookCall(b, sign(b));
    expect(res.status).toBe(200);
    expect((await res.json()).outcome).toBe("duplicate");
    expect(db.subscription.upsert).not.toHaveBeenCalled();
  });
});

const post = (body: unknown) => checkout.POST(new Request("http://x/api/billing/checkout", { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } }));

describe("checkout", () => {
  beforeEach(() => {
    auth.mockResolvedValue({ userId: "u1" });
    currentUser.mockResolvedValue({ emailAddresses: [{ emailAddress: "owner@example.com" }] });
  });
  it("needs sign-in", async () => {
    auth.mockResolvedValue({ userId: null });
    expect((await post({ plan: "STARTER", interval: "MONTHLY" })).status).toBe(401);
  });
  it("says plainly it is not open yet when no key is set", async () => {
    vi.stubEnv("PAYSTACK_SECRET_KEY", "");
    const res = await post({ plan: "STARTER", interval: "MONTHLY" });
    expect(res.status).toBe(503);
    expect((await res.json()).error).toMatch(/not open yet/i);
  });
  it("rejects an unknown plan or interval", async () => {
    vi.stubEnv("PAYSTACK_SECRET_KEY", SECRET);
    expect((await post({ plan: "PLATINUM", interval: "MONTHLY" })).status).toBe(400);
    expect((await post({ plan: "STARTER", interval: "WEEKLY" })).status).toBe(400);
    expect((await post({ plan: "FREE", interval: "MONTHLY" })).status).toBe(400);
  });
  it("asks Paystack for the price from our list, ignoring any amount the browser sends", async () => {
    vi.stubEnv("PAYSTACK_SECRET_KEY", SECRET);
    const fetchMock = vi.fn(async (_u: string, _i: RequestInit) => new Response(JSON.stringify({ status: true, data: { authorization_url: "https://checkout.paystack.com/abc" } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const res = await post({ plan: "STARTER", interval: "MONTHLY", amount: 1 });
    expect(res.status).toBe(200);
    expect((await res.json()).url).toBe("https://checkout.paystack.com/abc");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.paystack.co/transaction/initialize");
    expect((init.headers as Record<string, string>).authorization).toBe(`Bearer ${SECRET}`);
    const sent = JSON.parse(String(init.body));
    expect(sent).toMatchObject({ email: "owner@example.com", amount: 1_000_000, currency: "NGN", metadata: { userId: "u1", plan: "STARTER", interval: "MONTHLY" } });
    expect(sent.reference).toMatch(/^vos_[A-Za-z0-9]+$/);
  });
  it("charges the yearly price for a yearly purchase", async () => {
    vi.stubEnv("PAYSTACK_SECRET_KEY", SECRET);
    const fetchMock = vi.fn(async (_u: string, _i: RequestInit) => new Response(JSON.stringify({ status: true, data: { authorization_url: "https://checkout.paystack.com/y" } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await post({ plan: "GROWTH", interval: "ANNUAL" });
    expect(JSON.parse(String(fetchMock.mock.calls[0][1].body)).amount).toBe(25_000_000);
  });
  it("gives a calm message and leaks nothing when Paystack fails", async () => {
    vi.stubEnv("PAYSTACK_SECRET_KEY", SECRET);
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ status: false, message: "Invalid key sk_test_unit" }), { status: 401 })));
    const res = await post({ plan: "STARTER", interval: "MONTHLY" });
    expect(res.status).toBe(502);
    const text = JSON.stringify(await res.json());
    expect(text).not.toContain(SECRET);
    expect(text).toMatch(/could not start/i);
  });
});
