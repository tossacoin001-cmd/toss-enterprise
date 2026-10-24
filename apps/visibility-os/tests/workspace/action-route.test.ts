import { beforeEach, describe, expect, it, vi } from "vitest";

// The server decides who may change an action, not the page. A crafted request must fail even when the
// page would never have shown the button. Handoff section 4E.

const auth = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({ auth: () => auth() }));

const access = vi.fn();
vi.mock("@/lib/billing/access", () => ({ requireMutationAccess: () => access() }));

const db = {
  actionItem: {
    findFirst: vi.fn(),
    update: vi.fn(async (args: { where: { id: string }; data: Record<string, unknown> }) => ({ id: args.where.id, ...args.data })),
  },
};
vi.mock("@/lib/db", () => ({ db }));

const { PATCH } = await import("@/app/api/businesses/[id]/actions/[actionId]/route");

const NOW_ITEM = { id: "act1", businessId: "biz1", key: "page.title", title: "Add a title", description: "d", priority: "HIGH", category: "Website", status: "PENDING", note: null, completedAt: null, lastSeenFailingAt: null };
const call = (body: unknown, ids = { id: "biz1", actionId: "act1" }, raw = false) =>
  PATCH(new Request("http://localhost/api/x", { method: "PATCH", body: raw ? (body as string) : JSON.stringify(body), headers: { "content-type": "application/json" } }), { params: Promise.resolve(ids) });

beforeEach(() => {
  auth.mockReset();
  db.actionItem.findFirst.mockReset();
  db.actionItem.update.mockClear();
  auth.mockResolvedValue({ userId: "user1" });
  access.mockResolvedValue(null);
  db.actionItem.findFirst.mockResolvedValue(NOW_ITEM);
});

describe("after the trial", () => {
  it("is refused with the plain reason and nothing is changed", async () => {
    access.mockResolvedValue(new Response(JSON.stringify({ error: "Your free trial ended" }), { status: 403 }));
    const res = await call({ status: "DONE" });
    expect(res.status).toBe(403);
    expect(db.actionItem.update).not.toHaveBeenCalled();
  });
});

describe("who may change an action", () => {
  it("someone who is not signed in is refused before the database is touched", async () => {
    auth.mockResolvedValue({ userId: null });
    const res = await call({ status: "DONE" });
    expect(res.status).toBe(401);
    expect(db.actionItem.findFirst).not.toHaveBeenCalled();
    expect(db.actionItem.update).not.toHaveBeenCalled();
  });

  it("looks the action up by its id, its business AND the signed-in owner, so another user's action is simply not found", async () => {
    db.actionItem.findFirst.mockResolvedValue(null);
    const res = await call({ status: "DONE" });
    expect(res.status).toBe(404);
    const where = db.actionItem.findFirst.mock.calls[0][0].where;
    expect(where).toMatchObject({ id: "act1", businessId: "biz1", business: { userId: "user1" } });
    expect(db.actionItem.update).not.toHaveBeenCalled();
  });

  it("an action from a different business in the URL is not found either", async () => {
    db.actionItem.findFirst.mockResolvedValue(null);
    await call({ status: "DONE" }, { id: "someone-elses-biz", actionId: "act1" });
    expect(db.actionItem.findFirst.mock.calls[0][0].where).toMatchObject({ businessId: "someone-elses-biz", business: { userId: "user1" } });
  });
});

describe("what a valid request does", () => {
  it("marks an action done and records when", async () => {
    const res = await call({ status: "DONE" });
    expect(res.status).toBe(200);
    const data = db.actionItem.update.mock.calls[0][0].data;
    expect(data).toMatchObject({ status: "DONE", completedAt: expect.any(Date), lastSeenFailingAt: null });
    expect((await res.json()).item).toMatchObject({ id: "act1", status: "DONE" });
  });

  it("only the allowed fields are ever written, whatever the request contains", async () => {
    await call({ status: "IN_PROGRESS", note: "On it", title: "hacked", priority: "LOW", businessId: "x", id: "y", key: "z" });
    const data = db.actionItem.update.mock.calls[0][0].data;
    expect(Object.keys(data).sort()).toEqual(["note", "status"]);
    expect(db.actionItem.update.mock.calls[0][0].where).toEqual({ id: "act1" });
  });

  it("a request that changes nothing does not write", async () => {
    db.actionItem.findFirst.mockResolvedValue({ ...NOW_ITEM, status: "IN_PROGRESS" });
    const res = await call({ status: "IN_PROGRESS" });
    expect(res.status).toBe(200);
    expect(db.actionItem.update).not.toHaveBeenCalled();
  });
});

describe("bad requests get a plain 400 and change nothing", () => {
  it.each([
    ["an invalid status", { status: "FINISHED" }],
    ["a note that is too long", { note: "x".repeat(600) }],
    ["an empty request", {}],
  ])("%s", async (_n, body) => {
    const res = await call(body);
    expect(res.status).toBe(400);
    expect(typeof (await res.json()).error).toBe("string");
    expect(db.actionItem.update).not.toHaveBeenCalled();
  });

  it.each(["not json", "", "[1,2]", "null", "42"])("a body of %j", async (raw) => {
    const res = await call(raw, { id: "biz1", actionId: "act1" }, true);
    expect(res.status).toBe(400);
    expect(db.actionItem.update).not.toHaveBeenCalled();
  });

  it("a database failure is a calm 500 with nothing leaked", async () => {
    db.actionItem.update.mockRejectedValueOnce(new Error("connection string postgres://secret"));
    const res = await call({ status: "DONE" });
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toMatch(/postgres|secret/i);
  });
});
