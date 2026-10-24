import { describe, expect, it, vi } from "vitest";
import { runWeekly, type RunDeps, type UserOutcome } from "@/lib/weekly-run";
import { claimUser, releaseUser, startRun, finishRun, CLAIM_LEASE_MS, type ClaimDb, type RunRecordDb } from "@/lib/weekly-claim";

// Two overlapping cron runs must not email the same person twice, and every run leaves a durable record.

type U = { id: string };

describe("runWeekly with claims", () => {
  it("skips a user another run holds, and does not count them", async () => {
    const due = new Set(["a", "b"]);
    const processed: string[] = [];
    const held = new Set(["a"]);
    const deps: RunDeps<U> = {
      now: () => 0,
      findDueUsers: async (limit, ex) => [...due].filter((i) => !ex.includes(i)).slice(0, limit).map((id) => ({ id })),
      claim: async (u) => !held.has(u.id),
      release: async () => undefined,
      processUser: async (u) => {
        processed.push(u.id);
        due.delete(u.id);
        return "sent" as UserOutcome;
      },
    };
    const s = await runWeekly(deps, { budgetMs: 1000, concurrency: 3 });
    expect(processed).toEqual(["b"]);
    expect(s.usersProcessed).toBe(1);
    expect(s.skippedClaimed).toBe(1);
  });
  it("releases the claim even when processing throws", async () => {
    const release = vi.fn(async (_u: U) => undefined);
    const deps: RunDeps<U> = {
      now: () => 0,
      findDueUsers: async (limit, ex) => ["a"].filter((i) => !ex.includes(i)).slice(0, limit).map((id) => ({ id })),
      claim: async () => true,
      release,
      processUser: async () => { throw new Error("boom"); },
    };
    const s = await runWeekly(deps, { budgetMs: 1000 });
    expect(s.failed).toBe(1);
    expect(release).toHaveBeenCalledTimes(1);
  });
});

describe("claimUser", () => {
  const NOW = 1_000_000_000;
  it("claims with one conditional update that ignores live claims only", async () => {
    const updateMany = vi.fn(async (_a: unknown) => ({ count: 1 }));
    expect(await claimUser({ user: { updateMany } } as unknown as ClaimDb, "u1", NOW)).toBe(true);
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "u1", OR: [{ weeklyClaimAt: null }, { weeklyClaimAt: { lt: new Date(NOW - CLAIM_LEASE_MS) } }] },
      data: { weeklyClaimAt: new Date(NOW) },
    });
  });
  it("returns false when someone else holds it", async () => {
    expect(await claimUser({ user: { updateMany: async () => ({ count: 0 }) } } as unknown as ClaimDb, "u1", NOW)).toBe(false);
  });
  it("release clears the claim", async () => {
    const updateMany = vi.fn(async (_a: unknown) => ({ count: 1 }));
    await releaseUser({ user: { updateMany } } as unknown as ClaimDb, "u1");
    expect(updateMany).toHaveBeenCalledWith({ where: { id: "u1" }, data: { weeklyClaimAt: null } });
  });
});

describe("run record", () => {
  it("writes a start row, then the outcome on finish", async () => {
    const create = vi.fn(async (_a: unknown) => ({ id: "r1" }));
    const update = vi.fn(async (_a: unknown) => ({}));
    const db = { weeklyRun: { create, update } } as unknown as RunRecordDb;
    const id = await startRun(db, 111);
    expect(id).toBe("r1");
    expect(create).toHaveBeenCalledWith({ data: { startedAt: new Date(111) } });
    await finishRun(db, "r1", 222, { usersProcessed: 3, emailsSent: 2, skippedNoEmail: 0, skippedOptedOut: 1, skippedClaimed: 0, failed: 0, budgetExhausted: false });
    expect(update.mock.calls[0][0]).toMatchObject({ where: { id: "r1" }, data: { finishedAt: new Date(222), usersProcessed: 3, emailsSent: 2, failed: 0, budgetExhausted: false } });
  });
  it("a record failure never stops the run", async () => {
    const db = { weeklyRun: { create: async () => { throw new Error("db"); }, update: async () => ({}) } } as unknown as RunRecordDb;
    expect(await startRun(db, 1)).toBeNull();
    await expect(finishRun(db, null, 2, { usersProcessed: 0, emailsSent: 0, skippedNoEmail: 0, skippedOptedOut: 0, skippedClaimed: 0, failed: 0, budgetExhausted: false })).resolves.toBeUndefined();
  });
});
