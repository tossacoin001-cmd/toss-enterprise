import { beforeEach, describe, expect, it, vi } from "vitest";

// Clerk webhook: unsigned or unconfigured requests change nothing (handoff 5D).

const verify = vi.fn();
vi.mock("svix", () => ({ Webhook: class { verify = verify; } }));
const hdrs = new Map<string, string>();
vi.mock("next/headers", () => ({ headers: async () => ({ get: (k: string) => hdrs.get(k) ?? null }) }));
const db = { user: { upsert: vi.fn(async (_a: unknown) => ({})), update: vi.fn(async (_a: unknown) => ({})), delete: vi.fn(async (_a: unknown) => ({})) } };
vi.mock("@/lib/db", () => ({ db }));
const { POST } = await import("@/app/api/webhooks/clerk/route");
const call = () => POST(new Request("http://localhost/api/webhooks/clerk", { method: "POST", body: "{}" }));

beforeEach(() => {
  vi.clearAllMocks();
  hdrs.clear();
  vi.stubEnv("CLERK_WEBHOOK_SECRET", "whsec_test");
});

describe("clerk webhook", () => {
  it("refuses when the secret is not configured", async () => {
    vi.stubEnv("CLERK_WEBHOOK_SECRET", "");
    expect((await call()).status).toBe(500);
    expect(db.user.upsert).not.toHaveBeenCalled();
  });
  it("refuses missing svix headers", async () => {
    expect((await call()).status).toBe(400);
    expect(db.user.upsert).not.toHaveBeenCalled();
  });
  it("refuses a bad signature and writes nothing", async () => {
    for (const k of ["svix-id", "svix-timestamp", "svix-signature"]) hdrs.set(k, "x");
    verify.mockImplementation(() => { throw new Error("bad"); });
    expect((await call()).status).toBe(400);
    expect(db.user.upsert).not.toHaveBeenCalled();
  });
  it("creates the user for a verified user.created", async () => {
    for (const k of ["svix-id", "svix-timestamp", "svix-signature"]) hdrs.set(k, "x");
    verify.mockReturnValue({ type: "user.created", data: { id: "u1", email_addresses: [{ email_address: "a@b.co" }], first_name: "A", last_name: "B" } });
    expect((await call()).status).toBe(200);
    expect(db.user.upsert).toHaveBeenCalledTimes(1);
  });
});
