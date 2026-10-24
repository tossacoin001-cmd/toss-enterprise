import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The payment webhook is closed until configured, rejects anything unsigned, and never reads the body first.

const db = { billingEvent: { create: vi.fn(async (_a: unknown) => ({})) }, subscription: { findUnique: vi.fn(async (_a: unknown) => null), upsert: vi.fn(async (_a: unknown) => ({})) } };
vi.mock("@/lib/db", () => ({ db }));
const { POST } = await import("@/app/api/webhooks/flutterwave/route");

const body = JSON.stringify({ event: "charge.completed", data: { id: 1, tx_ref: "vos.u1.STARTER.n", amount: 1, currency: "NGN", status: "successful" } });
const call = (hash?: string) => POST(new Request("http://localhost/api/webhooks/flutterwave", { method: "POST", body, headers: hash ? { "verif-hash": hash } : {} }));

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllEnvs());

describe("flutterwave webhook", () => {
  it("is off (503) while no secret is configured, and writes nothing", async () => {
    vi.stubEnv("FLUTTERWAVE_WEBHOOK_HASH", "");
    expect((await call("anything")).status).toBe(503);
    expect(db.billingEvent.create).not.toHaveBeenCalled();
  });
  it("refuses a missing or wrong hash with 401 and writes nothing", async () => {
    vi.stubEnv("FLUTTERWAVE_WEBHOOK_HASH", "right");
    expect((await call()).status).toBe(401);
    expect((await call("wrong")).status).toBe(401);
    expect(db.billingEvent.create).not.toHaveBeenCalled();
  });
  it("accepts the right hash but does not activate anything while no price is confirmed", async () => {
    vi.stubEnv("FLUTTERWAVE_WEBHOOK_HASH", "right");
    const res = await call("right");
    expect(res.status).toBe(200);
    expect((await res.json()).outcome).toBe("rejected:no_price");
    expect(db.subscription.upsert).not.toHaveBeenCalled();
  });
});
