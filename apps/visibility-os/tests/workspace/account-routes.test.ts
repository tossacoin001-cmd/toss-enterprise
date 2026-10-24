import { beforeEach, describe, expect, it, vi } from "vitest";

// Account preferences, deletion and business edit: signed-in owner only, plain messages, nothing leaked.

const auth = vi.fn();
const deleteUser = vi.fn(async (_id: string) => undefined);
vi.mock("@clerk/nextjs/server", () => ({ auth: () => auth(), clerkClient: async () => ({ users: { deleteUser } }) }));
const access = vi.fn();
const google = vi.fn();
vi.mock("@/lib/billing/access", () => ({ requireMutationAccess: () => access(), requireGoogleAccess: () => google() }));
const db = {
  user: { updateMany: vi.fn(async (_a: unknown) => ({ count: 1 })), deleteMany: vi.fn(async (_a: unknown) => ({ count: 1 })) },
  scan: { deleteMany: vi.fn(async (_a: unknown) => ({ count: 0 })) },
  business: { updateMany: vi.fn(async (_a: unknown) => ({ count: 1 })), findFirst: vi.fn(async (_a: unknown) => ({ id: "b1", name: "New" })) },
};
vi.mock("@/lib/db", () => ({ db }));

const prefs = await import("@/app/api/account/preferences/route");
const account = await import("@/app/api/account/route");
const biz = await import("@/app/api/businesses/[id]/route");

const req = (method: string, body?: unknown) => new Request("http://x/api", { method, body: body === undefined ? undefined : JSON.stringify(body), headers: { "content-type": "application/json" } });

beforeEach(() => {
  vi.clearAllMocks();
  auth.mockResolvedValue({ userId: "u1" });
  access.mockResolvedValue(null);
  google.mockResolvedValue(null);
  db.user.updateMany.mockResolvedValue({ count: 1 });
  db.business.updateMany.mockResolvedValue({ count: 1 });
});

describe("weekly email preference", () => {
  it("needs sign-in", async () => {
    auth.mockResolvedValue({ userId: null });
    expect((await prefs.PATCH(req("PATCH", { weeklyEmail: false }))).status).toBe(401);
  });
  it("rejects anything but a true/false value", async () => {
    expect((await prefs.PATCH(req("PATCH", { weeklyEmail: "no" }))).status).toBe(400);
    expect(db.user.updateMany).not.toHaveBeenCalled();
  });
  it("turns it off for this user only", async () => {
    const res = await prefs.PATCH(req("PATCH", { weeklyEmail: false }));
    expect(res.status).toBe(200);
    expect(db.user.updateMany).toHaveBeenCalledWith({ where: { id: "u1" }, data: { digestOptOut: true } });
  });
});

describe("account deletion", () => {
  it("needs sign-in and the exact phrase", async () => {
    auth.mockResolvedValue({ userId: null });
    expect((await account.DELETE(req("DELETE", { confirm: "delete my account" }))).status).toBe(401);
    auth.mockResolvedValue({ userId: "u1" });
    expect((await account.DELETE(req("DELETE", { confirm: "yes" }))).status).toBe(400);
    expect((await account.DELETE(req("DELETE"))).status).toBe(400);
    expect(db.user.deleteMany).not.toHaveBeenCalled();
    expect(deleteUser).not.toHaveBeenCalled();
  });
  it("deletes the data and the sign-in", async () => {
    const res = await account.DELETE(req("DELETE", { confirm: "Delete my account" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ deleted: true, signInKept: false });
    expect(db.user.deleteMany).toHaveBeenCalledWith({ where: { id: "u1" } });
    expect(deleteUser).toHaveBeenCalledWith("u1");
  });
  it("works after the trial has ended (it is not held back)", async () => {
    access.mockResolvedValue(new Response("x", { status: 403 }));
    expect((await account.DELETE(req("DELETE", { confirm: "delete my account" }))).status).toBe(200);
  });
});

describe("editing a business", () => {
  it("needs sign-in, access and a valid name", async () => {
    auth.mockResolvedValue({ userId: null });
    expect((await biz.PUT(req("PUT", { name: "Spa" }), { params: Promise.resolve({ id: "b1" }) })).status).toBe(401);
    auth.mockResolvedValue({ userId: "u1" });
    expect((await biz.PUT(req("PUT", { name: "" }), { params: Promise.resolve({ id: "b1" }) })).status).toBe(400);
    access.mockResolvedValue(new Response(JSON.stringify({ error: "paused" }), { status: 403 }));
    expect((await biz.PUT(req("PUT", { name: "Spa" }), { params: Promise.resolve({ id: "b1" }) })).status).toBe(403);
    expect(db.business.updateMany).not.toHaveBeenCalled();
  });
  it("updates only the owner's business and never the owner or the Google link", async () => {
    const res = await biz.PUT(req("PUT", { name: "New Spa", city: "Lagos", userId: "evil", googlePlaceId: "x" }), { params: Promise.resolve({ id: "b1" }) });
    expect(res.status).toBe(200);
    const arg = db.business.updateMany.mock.calls[0][0] as { where: unknown; data: Record<string, unknown> };
    expect(arg.where).toEqual({ id: "b1", userId: "u1" });
    expect(arg.data).toMatchObject({ name: "New Spa", city: "Lagos" });
    expect(arg.data).not.toHaveProperty("userId");
    expect(arg.data).not.toHaveProperty("googlePlaceId");
  });
  it("says not found for someone else's business", async () => {
    db.business.updateMany.mockResolvedValue({ count: 0 });
    expect((await biz.PUT(req("PUT", { name: "Spa" }), { params: Promise.resolve({ id: "other" }) })).status).toBe(404);
  });
});

describe("connecting Google is part of the Growth package", () => {
  it("is refused for a package without it, before anything is looked up", async () => {
    google.mockResolvedValue(new Response(JSON.stringify({ error: "Connecting your Google listing is part of the Growth package." }), { status: 403 }));
    const res = await biz.PATCH(req("PATCH", { googlePlaceId: "abc" }), { params: Promise.resolve({ id: "b1" }) });
    expect(res.status).toBe(403);
    expect(db.business.updateMany).not.toHaveBeenCalled();
  });
});
