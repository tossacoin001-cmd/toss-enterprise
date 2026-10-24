import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanupExpiredScans, type CleanupDb } from "@/lib/account/cleanup";
import { buildExport, type ExportDb } from "@/lib/account/export";
import { deleteAccount, DELETE_PHRASE, type DeleteDb } from "@/lib/account/delete";

// Data controls: the 30-day promise for anonymous checks, a full export of what we hold, and deletion
// that needs an explicit phrase and removes everything. Handoff 5D.

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 9, 23);

describe("cleanupExpiredScans", () => {
  it("deletes only expired, unclaimed checks", async () => {
    const deleteMany = vi.fn(async (_a: unknown) => ({ count: 4 }));
    const n = await cleanupExpiredScans({ scan: { deleteMany } } as unknown as CleanupDb, NOW);
    expect(n).toBe(4);
    expect(deleteMany).toHaveBeenCalledWith({ where: { expiresAt: { lt: new Date(NOW) }, claimedByUserId: null } });
  });
});

describe("buildExport", () => {
  const db = {
    user: { findUnique: vi.fn(async (_a: unknown) => ({ id: "u1", email: "a@b.co", name: "A", plan: "FREE", trialStartedAt: new Date(NOW), trialEndsAt: new Date(NOW + 7 * DAY), digestOptOut: false, createdAt: new Date(NOW) })) },
    business: { findMany: vi.fn(async (_a: unknown) => [{ id: "b1", name: "Spa", visibilityScores: [{ total: 60 }], actionItems: [{ title: "t", status: "DONE", note: "n" }] }]) },
    scan: { findMany: vi.fn(async (_a: unknown) => [{ id: "s1", url: "https://x.co", createdAt: new Date(NOW), result: { score: 50 } }]) },
    subscription: { findUnique: vi.fn(async (_a: unknown) => null) },
  };
  it("includes the account, businesses with scores and actions, and claimed checks", async () => {
    const out = await buildExport(db as unknown as ExportDb, "u1", NOW);
    expect(out.account).toMatchObject({ email: "a@b.co" });
    expect(out.businesses[0].actionItems[0]).toMatchObject({ note: "n" });
    expect(out.checks).toHaveLength(1);
    expect(out.exportedAt).toBe(new Date(NOW).toISOString());
  });
  it("asks only for this user's rows", async () => {
    await buildExport(db as unknown as ExportDb, "u1", NOW);
    expect(db.business.findMany.mock.calls[0][0]).toMatchObject({ where: { userId: "u1" } });
    expect(db.scan.findMany.mock.calls[0][0]).toMatchObject({ where: { claimedByUserId: "u1" } });
  });
  it("never includes secrets or other people's data", async () => {
    const text = JSON.stringify(await buildExport(db as unknown as ExportDb, "u1", NOW));
    expect(text).not.toMatch(/visitorHash|password|secret/i);
  });
});

describe("deleteAccount", () => {
  const make = () => ({
    scan: { deleteMany: vi.fn(async (_a: unknown) => ({ count: 1 })) },
    user: { deleteMany: vi.fn(async (_a: unknown) => ({ count: 1 })) },
  });
  it("refuses without the exact phrase and deletes nothing", async () => {
    const db = make();
    const remove = vi.fn(async () => undefined);
    expect(await deleteAccount(db as unknown as DeleteDb, "u1", "delete", remove)).toEqual({ ok: false, reason: "confirm" });
    expect(await deleteAccount(db as unknown as DeleteDb, "u1", undefined, remove)).toEqual({ ok: false, reason: "confirm" });
    expect(db.user.deleteMany).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });
  it("deletes claimed checks, the account's data and the sign-in, in that order", async () => {
    const db = make();
    const order: string[] = [];
    db.scan.deleteMany.mockImplementation(async () => { order.push("scans"); return { count: 1 }; });
    db.user.deleteMany.mockImplementation(async () => { order.push("user"); return { count: 1 }; });
    const remove = vi.fn(async () => { order.push("clerk"); });
    expect(await deleteAccount(db as unknown as DeleteDb, "u1", DELETE_PHRASE, remove)).toEqual({ ok: true });
    expect(order).toEqual(["scans", "user", "clerk"]);
    expect(db.user.deleteMany).toHaveBeenCalledWith({ where: { id: "u1" } });
  });
  it("still reports success for our data when the sign-in removal fails, and says so", async () => {
    const db = make();
    const remove = vi.fn(async () => { throw new Error("clerk down"); });
    expect(await deleteAccount(db as unknown as DeleteDb, "u1", DELETE_PHRASE, remove)).toEqual({ ok: true, signInKept: true });
  });
});

describe("routes", () => {
  const auth = vi.fn();
  const buildExportMock = vi.fn();
  beforeEach(() => {
    vi.resetModules();
    auth.mockReset();
  });
  it("export refuses the signed-out and downloads for the signed-in, even after the trial", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({ auth: () => auth(), clerkClient: async () => ({ users: { deleteUser: vi.fn() } }) }));
    vi.doMock("@/lib/db", () => ({ db: {} }));
    vi.doMock("@/lib/account/export", () => ({ buildExport: (...a: unknown[]) => buildExportMock(...a) }));
    buildExportMock.mockResolvedValue({ account: { email: "a@b.co" }, businesses: [], checks: [], exportedAt: "x" });
    const { GET } = await import("@/app/api/account/export/route");
    auth.mockResolvedValue({ userId: null });
    expect((await GET()).status).toBe(401);
    auth.mockResolvedValue({ userId: "u1" });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-disposition")).toMatch(/attachment; filename="visibility-os-data-/);
    expect(buildExportMock).toHaveBeenCalledWith(expect.anything(), "u1", expect.any(Number));
  });
  it("cleanup cron needs the secret", async () => {
    vi.doMock("@/lib/db", () => ({ db: { scan: { deleteMany: vi.fn(async () => ({ count: 2 })) } } }));
    vi.stubEnv("CRON_SECRET", "s");
    const { GET } = await import("@/app/api/cron/cleanup-scans/route");
    expect((await GET(new Request("http://x/api/cron/cleanup-scans"))).status).toBe(401);
    const ok = await GET(new Request("http://x/api/cron/cleanup-scans", { headers: { authorization: "Bearer s" } }));
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ deleted: 2 });
    vi.unstubAllEnvs();
  });
  it("cleanup cron is scheduled in vercel.json", async () => {
    const { readFileSync } = await import("node:fs");
    const v = JSON.parse(readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"));
    expect(v.crons.map((c: { path: string }) => c.path)).toContain("/api/cron/cleanup-scans");
  });
});
