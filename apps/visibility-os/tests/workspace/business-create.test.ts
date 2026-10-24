import { beforeEach, describe, expect, it, vi } from "vitest";

// Adding a business: signed in, within the limit, and (when it came from a free check) the check is saved
// to the account without ever losing the business. Handoff sections 4C and 6.

const auth = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({ auth: () => auth(), currentUser: async () => ({ emailAddresses: [{ emailAddress: "a@b.co" }], firstName: "A", lastName: "B" }) }));

const access = vi.fn();
vi.mock("@/lib/billing/access", () => ({ requireMutationAccess: () => access() }));

const SCAN = "a".repeat(32);
const db = {
  user: { findUnique: vi.fn(), upsert: vi.fn() },
  business: { count: vi.fn(), create: vi.fn(async (args: { data: Record<string, unknown> }) => ({ id: "biz1", ...args.data })) },
  $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(db)),
  scan: {
    findUnique: vi.fn(),
    updateMany: vi.fn(async (_args: unknown) => ({ count: 1 })),
  },
};
vi.mock("@/lib/db", () => ({ db }));

const { POST } = await import("@/app/api/businesses/route");
const call = (body: unknown) => POST(new Request("http://localhost/api/businesses", { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } }));

beforeEach(() => {
  vi.clearAllMocks();
  auth.mockResolvedValue({ userId: "user1" });
  access.mockResolvedValue(null);
  db.$transaction.mockImplementation(async (fn: (tx: unknown) => unknown) => fn(db));
  db.user.findUnique.mockResolvedValue({ id: "user1" });
  db.business.count.mockResolvedValue(0);
  db.scan.findUnique.mockResolvedValue({ id: SCAN, siteKey: null, url: null, status: "done", claimedByUserId: null, expiresAt: new Date(Date.now() + 86_400_000), result: {} });
});

describe("who and how many", () => {
  it("refuses someone who is not signed in, before anything is written", async () => {
    auth.mockResolvedValue({ userId: null });
    expect((await call({ name: "Toss Spa" })).status).toBe(401);
    expect(db.business.create).not.toHaveBeenCalled();
  });

  it("refuses a business over the limit, with the limit in the message, and writes nothing", async () => {
    db.business.count.mockResolvedValue(3);
    const res = await call({ name: "Another" });
    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/up to 3 businesses/i);
    expect(db.business.create).not.toHaveBeenCalled();
  });

  it("holds changes back when the trial has ended and enforcement is on, writing nothing", async () => {
    access.mockResolvedValue(new Response(JSON.stringify({ error: "Your free trial ended, so changes are paused." }), { status: 403 }));
    const res = await call({ name: "Toss Spa" });
    expect(res.status).toBe(403);
    expect(db.business.create).not.toHaveBeenCalled();
  });

  it("refuses a missing name with a plain message", async () => {
    const res = await call({ name: "" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/name/i);
  });
});

describe("a business that came from a free check", () => {
  it("saves the business, then saves the check to this account", async () => {
    const res = await call({ name: "Toss Spa", scanId: SCAN });
    expect(res.status).toBe(201);
    expect((await res.json()).scan).toBe("claimed");
    expect(db.scan.updateMany).toHaveBeenCalledTimes(1);
    expect(db.scan.updateMany.mock.calls[0][0]).toMatchObject({ where: { id: SCAN }, data: { claimedByUserId: "user1" } });
  });

  it("the scan id is never stored on the business itself", async () => {
    await call({ name: "Toss Spa", scanId: SCAN });
    expect(db.business.create.mock.calls[0][0].data).not.toHaveProperty("scanId");
  });

  it("a check someone else already saved is left alone, and the business is still created", async () => {
    db.scan.findUnique.mockResolvedValue({ id: SCAN, status: "done", claimedByUserId: "someone-else", expiresAt: new Date(Date.now() + 86_400_000), result: {}, siteKey: null, url: null });
    const res = await call({ name: "Toss Spa", scanId: SCAN });
    expect(res.status).toBe(201);
    expect((await res.json()).scan).toBe("taken");
    expect(db.scan.updateMany).not.toHaveBeenCalled();
  });

  it("a database error while saving the check never loses the business", async () => {
    db.scan.findUnique.mockRejectedValue(new Error("db down"));
    const res = await call({ name: "Toss Spa", scanId: SCAN });
    expect(res.status).toBe(201);
    expect((await res.json()).business.id).toBe("biz1");
  });

  it("a made-up scan id is ignored safely", async () => {
    const res = await call({ name: "Toss Spa", scanId: "../../etc/passwd" });
    expect(res.status).toBe(201);
    expect((await res.json()).scan).toBe("invalid");
    expect(db.scan.findUnique).not.toHaveBeenCalled();
  });

  it("with no scan id, nothing about scans is touched", async () => {
    const res = await call({ name: "Toss Spa" });
    expect(res.status).toBe(201);
    expect((await res.json()).scan).toBeNull();
    expect(db.scan.findUnique).not.toHaveBeenCalled();
  });
});
