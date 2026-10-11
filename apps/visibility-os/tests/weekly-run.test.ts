import { describe, expect, it } from "vitest";
import { runWeekly, type RunDeps, type UserOutcome } from "@/lib/weekly-run";

type U = { id: string };

/** In-memory stand-in for the database: a user stays "due" until processed OK. */
function fakeDeps(ids: string[], outcomeFor: (id: string) => UserOutcome | "throw", tick = 0) {
  const due = new Set(ids);
  let clock = 0;
  const processed: string[] = [];
  const deps: RunDeps<U> = {
    now: () => clock,
    async findDueUsers(limit, excludeIds) {
      return [...due]
        .filter((id) => !excludeIds.includes(id))
        .slice(0, limit)
        .map((id) => ({ id }));
    },
    async processUser(user) {
      processed.push(user.id);
      clock += tick;
      const outcome = outcomeFor(user.id);
      if (outcome === "throw") throw new Error("boom");
      if (outcome !== "failed") due.delete(user.id);
      return outcome;
    },
  };
  return { deps, processed, due };
}

describe("runWeekly", () => {
  it("processes everyone once and tallies outcomes", async () => {
    const outcomes: Record<string, UserOutcome> = {
      a: "sent",
      b: "sent",
      c: "skipped_no_email",
      d: "skipped_opted_out",
    };
    const { deps, processed } = fakeDeps(["a", "b", "c", "d"], (id) => outcomes[id]);
    const summary = await runWeekly(deps, { budgetMs: 1000, concurrency: 3 });
    expect([...processed].sort()).toEqual(["a", "b", "c", "d"]);
    expect(summary).toMatchObject({
      usersProcessed: 4,
      emailsSent: 2,
      skippedNoEmail: 1,
      skippedOptedOut: 1,
      failed: 0,
      budgetExhausted: false,
    });
  });

  it("does not retry a failed user within the same run", async () => {
    const { deps, processed } = fakeDeps(["a", "b"], (id) => (id === "a" ? "failed" : "sent"));
    const summary = await runWeekly(deps, { budgetMs: 1000, concurrency: 1 });
    expect(processed.filter((id) => id === "a")).toHaveLength(1);
    expect(summary.failed).toBe(1);
    expect(summary.emailsSent).toBe(1);
  });

  it("counts a thrown error as a failure and keeps going", async () => {
    const { deps } = fakeDeps(["a", "b"], (id) => (id === "a" ? "throw" : "sent"));
    const summary = await runWeekly(deps, { budgetMs: 1000, concurrency: 1 });
    expect(summary.failed).toBe(1);
    expect(summary.emailsSent).toBe(1);
  });

  it("stops starting work when the time budget is spent and says so", async () => {
    // Each user costs 10 "ms"; a 25ms budget fits three users, one at a time.
    const { deps, processed } = fakeDeps(["a", "b", "c", "d", "e", "f"], () => "sent", 10);
    const summary = await runWeekly(deps, { budgetMs: 25, concurrency: 1 });
    expect(processed).toEqual(["a", "b", "c"]);
    expect(summary.budgetExhausted).toBe(true);
  });

  it("reports nothing exhausted when everyone fit in the budget", async () => {
    const { deps } = fakeDeps(["a"], () => "sent", 10);
    const summary = await runWeekly(deps, { budgetMs: 25, concurrency: 1 });
    expect(summary.budgetExhausted).toBe(false);
  });

  it("does nothing when nobody is due", async () => {
    const { deps } = fakeDeps([], () => "sent");
    expect(await runWeekly(deps)).toMatchObject({ usersProcessed: 0, budgetExhausted: false });
  });
});
