import { describe, expect, it, vi } from "vitest";
import { createWithinLimit, type LimitDb } from "@/lib/billing/limit";

// Two quick requests must not both slip under the business limit. The count and the create run together
// in one serializable transaction; a clash is retried once.

const make = (count: number, failures: string[] = []) => {
  const tx = { business: { count: vi.fn(async () => count), create: vi.fn(async (a: { data: Record<string, unknown> }) => ({ id: "b1", ...a.data })) } };
  const queue = [...failures];
  const db = {
    $transaction: vi.fn(async (fn: (t: typeof tx) => Promise<unknown>, opts: unknown) => {
      expect(opts).toEqual({ isolationLevel: "Serializable" });
      const code = queue.shift();
      if (code) throw Object.assign(new Error("clash"), { code });
      return fn(tx);
    }),
  };
  return { db, tx, limitDb: db as unknown as LimitDb };
};

describe("createWithinLimit", () => {
  it("creates when under the limit", async () => {
    const { limitDb, tx } = make(2);
    const r = await createWithinLimit(limitDb, "u1", { name: "A" }, 3);
    expect(r).toEqual({ ok: true, business: { id: "b1", name: "A", userId: "u1" } });
    expect(tx.business.create).toHaveBeenCalledTimes(1);
  });
  it("refuses at the limit and writes nothing", async () => {
    const { limitDb, tx } = make(3);
    expect(await createWithinLimit(limitDb, "u1", { name: "A" }, 3)).toEqual({ ok: false });
    expect(tx.business.create).not.toHaveBeenCalled();
  });
  it("retries once after a serialization clash", async () => {
    const { limitDb, db } = make(0, ["P2034"]);
    expect((await createWithinLimit(limitDb, "u1", { name: "A" }, 3)).ok).toBe(true);
    expect(db.$transaction).toHaveBeenCalledTimes(2);
  });
  it("gives up after a second clash and throws", async () => {
    const { limitDb } = make(0, ["P2034", "P2034"]);
    await expect(createWithinLimit(limitDb, "u1", { name: "A" }, 3)).rejects.toThrow();
  });
  it("does not retry other errors", async () => {
    const { limitDb, db } = make(0, ["P1001"]);
    await expect(createWithinLimit(limitDb, "u1", { name: "A" }, 3)).rejects.toThrow();
    expect(db.$transaction).toHaveBeenCalledTimes(1);
  });
});
