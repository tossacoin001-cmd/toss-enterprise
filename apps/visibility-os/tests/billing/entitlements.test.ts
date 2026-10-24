import { describe, expect, it } from "vitest";
import { TRIAL_DAYS, accessFor, guardMutation, startTrialIfNeeded, type AccessFacts, type TrialDb } from "@/lib/billing/entitlements";

// Access has one source of truth. The seven-day trial starts once, exactly, and needs no card; the public
// scan is a separate thing and is not affected. Handoff section 6.

const DAY = 86_400_000;
const T0 = Date.parse("2026-10-23T10:00:00Z");
const facts = (over: Partial<AccessFacts> = {}): AccessFacts => ({ plan: "FREE", trialStartedAt: new Date(T0), trialEndsAt: new Date(T0 + 7 * DAY), subscription: null, ...over });

describe("the trial", () => {
  it("is seven days", () => expect(TRIAL_DAYS).toBe(7));

  it("is active from the start, and says how long is left", () => {
    const a = accessFor(facts(), T0);
    expect(a.state).toBe("trial_active");
    expect(a.daysLeft).toBe(7);
    expect(a.canUse).toBe(true);
    expect(a.canMutate).toBe(true);
  });

  it.each([
    [T0 + 7 * DAY - 1, "trial_active", 1],
    [T0 + 7 * DAY, "trial_ended", 0],
    [T0 + 7 * DAY + 1, "trial_ended", 0],
    [T0 + 3 * DAY + 1, "trial_active", 4],
    [T0 - 1000, "trial_active", 7], // a clock a little behind ours never ends it early
  ])("at %i it is %s with %i days left (the end is exact)", (now, state, days) => {
    const a = accessFor(facts(), now);
    expect(a.state).toBe(state);
    expect(a.daysLeft).toBe(days);
  });

  it("after it ends the data is still readable, and only changes are held back", () => {
    const a = accessFor(facts(), T0 + 8 * DAY);
    expect(a.canUse).toBe(true);
    expect(a.canMutate).toBe(false);
    expect(a.businessLimit).toBe(3);
    expect(a.canExport).toBe(true);
  });

  it("shows the end date in Lagos time, on the right day near midnight", () => {
    const late = accessFor(facts({ trialStartedAt: new Date("2026-10-23T22:30:00Z"), trialEndsAt: new Date("2026-10-30T22:30:00Z") }), T0);
    expect(late.endsText).toBe("30 Oct 2026");
    const after = accessFor(facts({ trialStartedAt: new Date("2026-10-23T23:30:00Z"), trialEndsAt: new Date("2026-10-30T23:30:00Z") }), T0);
    expect(after.endsText).toBe("31 Oct 2026");
  });

  it("a plain label and a detail that never mention a card or an automatic charge", () => {
    for (const now of [T0, T0 + 8 * DAY]) {
      const a = accessFor(facts(), now);
      expect(a.label.length).toBeGreaterThan(3);
      expect(`${a.label} ${a.detail}`).not.toMatch(/card|automatic|auto-renew|charged/i);
    }
    expect(accessFor(facts(), T0).detail).toMatch(/no payment|no card is needed|free/i);
  });
});

describe("paid and in-between states (used when billing is switched on)", () => {
  const paid = (status: NonNullable<AccessFacts["subscription"]>["status"], extra: Partial<NonNullable<AccessFacts["subscription"]>> = {}) =>
    facts({ plan: "GROWTH", subscription: { status, currentPeriodEnd: new Date(T0 + 20 * DAY), cancelAtPeriodEnd: false, ...extra } });

  it("a paid, active subscription can use and change everything, whatever the trial did", () => {
    const a = accessFor(paid("active"), T0 + 30 * DAY);
    expect(a).toMatchObject({ state: "paid_active", canUse: true, canMutate: true });
  });

  it("a payment that is pending is not access yet: the trial rules still apply", () => {
    expect(accessFor(paid("pending"), T0 + 8 * DAY).state).toBe("payment_pending");
    expect(accessFor(paid("pending"), T0 + 8 * DAY).canMutate).toBe(false);
    expect(accessFor(paid("pending"), T0 + 2 * DAY).canMutate).toBe(true);
  });

  it("a cancelled subscription keeps access until its period ends, then stops", () => {
    const sub = paid("active", { cancelAtPeriodEnd: true });
    expect(accessFor(sub, T0 + 10 * DAY).state).toBe("cancelled_at_period_end");
    expect(accessFor(sub, T0 + 10 * DAY).canMutate).toBe(true);
    expect(accessFor(sub, T0 + 21 * DAY).state).toBe("expired");
    expect(accessFor(sub, T0 + 21 * DAY).canMutate).toBe(false);
    expect(accessFor(sub, T0 + 21 * DAY).canUse).toBe(true); // data stays readable
  });

  it("a payment that failed is a grace state: nothing is taken away at once", () => {
    const a = accessFor(paid("past_due"), T0 + 21 * DAY);
    expect(a.state).toBe("past_due");
    expect(a.canUse).toBe(true);
    expect(a.detail).toMatch(/payment/i);
  });

  it("a subscription that has ended and an ended trial are both 'expired', and data is kept", () => {
    const a = accessFor(paid("ended"), T0 + 30 * DAY);
    expect(a.state).toBe("expired");
    expect(a.canUse).toBe(true);
    expect(a.canExport).toBe(true);
  });
});

describe("accounts that existed before the trial did", () => {
  it("an account with no trial recorded is not treated as expired: it is simply not started yet", () => {
    const a = accessFor(facts({ trialStartedAt: null, trialEndsAt: null }), T0);
    expect(a.state).toBe("trial_not_started");
    expect(a.canUse).toBe(true);
    expect(a.canMutate).toBe(true);
  });
});

describe("startTrialIfNeeded: the trial starts once, and only once", () => {
  function fakeDb(initial: { trialStartedAt: Date | null; trialEndsAt: Date | null }) {
    const user = { ...initial };
    const db: TrialDb = {
      user: {
        updateMany: async ({ where, data }) => {
          if (where.trialStartedAt !== null || user.trialStartedAt !== null) return { count: 0 };
          Object.assign(user, data);
          return { count: 1 };
        },
        findUnique: async () => ({ ...user }),
      },
    };
    return { db, user };
  }

  it("starts for an account that has none, ending exactly seven days later", async () => {
    const { db, user } = fakeDb({ trialStartedAt: null, trialEndsAt: null });
    const r = await startTrialIfNeeded(db, "u1", T0);
    expect(r).toEqual({ trialStartedAt: new Date(T0), trialEndsAt: new Date(T0 + 7 * DAY) });
    expect(user.trialEndsAt).toEqual(new Date(T0 + 7 * DAY));
  });

  it("never restarts: a later visit keeps the first dates", async () => {
    const { db } = fakeDb({ trialStartedAt: null, trialEndsAt: null });
    const first = await startTrialIfNeeded(db, "u1", T0);
    const later = await startTrialIfNeeded(db, "u1", T0 + 3 * DAY);
    expect(later).toEqual(first);
  });

  it("two visits at the same moment make one trial", async () => {
    const { db } = fakeDb({ trialStartedAt: null, trialEndsAt: null });
    const [a, b] = await Promise.all([startTrialIfNeeded(db, "u1", T0), startTrialIfNeeded(db, "u1", T0 + 5)]);
    expect(a).toEqual(b);
  });

  it("an account whose trial already ended is not given another", async () => {
    const { db } = fakeDb({ trialStartedAt: new Date(T0 - 30 * DAY), trialEndsAt: new Date(T0 - 23 * DAY) });
    const r = await startTrialIfNeeded(db, "u1", T0);
    expect(r.trialEndsAt).toEqual(new Date(T0 - 23 * DAY));
  });
});

describe("guardMutation: the server says no, with a reason a person can act on", () => {
  it("lets an active trial and a paid account make changes", () => {
    expect(guardMutation(accessFor(facts(), T0), true)).toEqual({ ok: true });
    expect(guardMutation(accessFor(facts({ plan: "GROWTH", subscription: { status: "active", currentPeriodEnd: new Date(T0 + DAY), cancelAtPeriodEnd: false } }), T0), true)).toEqual({ ok: true });
  });

  it("holds changes back after the trial, when enforcement is on, and names the date", () => {
    const g = guardMutation(accessFor(facts(), T0 + 8 * DAY), true);
    expect(g).toMatchObject({ ok: false, status: 403 });
    expect((g as { error: string }).error).toMatch(/trial ended on 30 Oct 2026/i);
    expect((g as { error: string }).error).toMatch(/still (see|read|download)/i);
  });

  it("while enforcement is off (paid plans are not on sale yet), nothing is held back", () => {
    expect(guardMutation(accessFor(facts(), T0 + 8 * DAY), false)).toEqual({ ok: true });
  });
});
