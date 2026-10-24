import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { describeScore, type ScoreRow } from "@/lib/workspace/score-state";

// "No scan yet", "a real zero" and "could not check" are three different things, and the dashboard used
// to treat all of them as 0. These tests pin the difference. Handoff section 4D and section 5.

const NOW = Date.parse("2026-10-23T10:00:00Z");
const DAY = 86_400_000;
const f = (id: string, group: "website" | "social", state: "found" | "missing" | "could_not_check", points: number) => ({ id, group, state, points, earned: state === "found" ? points : 0 });

const row = (over: Partial<ScoreRow> = {}): ScoreRow => ({
  total: 62, googleScore: 0, socialScore: 40, websiteScore: 80, reviewCount: 0, avgRating: 0, recordedAt: new Date(NOW - 2 * DAY),
  findings: [f("site.reachable", "website", "found", 25), f("social.present", "social", "found", 40)],
  ...over,
});

describe("no scan versus a genuine zero", () => {
  it("no row at all is 'none': there is nothing to show, and the first check is the action", () => {
    const v = describeScore(null, { hasGoogle: false }, NOW);
    expect(v.state).toBe("none");
    expect(v.total).toBeNull();
    expect(v.canRecheck).toBe(true);
    expect(v.primaryAction).toBe("run_first_check");
  });

  it("a stored zero is a real zero: the number is shown, and checking again is offered", () => {
    const v = describeScore(row({ total: 0, websiteScore: 0, socialScore: 0, findings: [f("site.reachable", "website", "missing", 25)] }), { hasGoogle: false }, NOW);
    expect(v.state).toBe("checked");
    expect(v.total).toBe(0);
    expect(v.canRecheck).toBe(true);
    expect(v.primaryAction).toBe("recheck");
  });

  it("never turns a missing score into zero anywhere", () => {
    expect(describeScore(null, { hasGoogle: false }, NOW).total).not.toBe(0);
  });
});

describe("parts that were not checked are not zeros", () => {
  it("with no Google listing, Google and reviews say 'not connected', never 0 and never a star rating", () => {
    const v = describeScore(row(), { hasGoogle: false }, NOW);
    expect(v.parts.google).toEqual({ kind: "not_connected" });
    expect(v.parts.reviews).toEqual({ kind: "not_connected" });
  });

  it("with a Google listing, the stored review count and rating are shown, and zero reviews is a real zero", () => {
    const v = describeScore(row({ googleScore: 80, reviewCount: 0, avgRating: 0 }), { hasGoogle: true }, NOW);
    expect(v.parts.google).toEqual({ kind: "score", value: 80 });
    expect(v.parts.reviews).toEqual({ kind: "count", count: 0, rating: null });
    const withReviews = describeScore(row({ googleScore: 80, reviewCount: 12, avgRating: 4.6 }), { hasGoogle: true }, NOW);
    expect(withReviews.parts.reviews).toEqual({ kind: "count", count: 12, rating: 4.6 });
  });

  it("a part whose checks could not be made says 'not checked', not 0", () => {
    const v = describeScore(row({ socialScore: 0, findings: [f("social.present", "social", "could_not_check", 40), f("site.reachable", "website", "found", 25)] }), { hasGoogle: false }, NOW);
    expect(v.parts.social).toEqual({ kind: "not_checked" });
    expect(v.parts.website).toEqual({ kind: "score", value: 80 });
  });

  it("an older row with no saved findings shows its stored numbers, since nothing says they were unchecked", () => {
    const v = describeScore(row({ findings: null }), { hasGoogle: false }, NOW);
    expect(v.parts.social).toEqual({ kind: "score", value: 40 });
    expect(v.coverage).toBeNull();
  });
});

describe("coverage and partial results", () => {
  it("coverage is the share of check points that could be made", () => {
    const v = describeScore(row({ findings: [f("a", "website", "found", 60), f("b", "website", "could_not_check", 20), f("c", "social", "missing", 20)] }), { hasGoogle: false }, NOW);
    expect(v.coverage).toBe(80);
    expect(v.state).toBe("partial");
  });

  it("a fully checked result is 'checked', with full coverage", () => {
    const v = describeScore(row(), { hasGoogle: false }, NOW);
    expect(v.state).toBe("checked");
    expect(v.coverage).toBe(100);
  });
});

describe("freshness", () => {
  it.each([
    [0.01, "checked"], [2, "checked"], [9, "checked"],
    [11, "stale"], [40, "stale"],
  ])("a result %s days old is %s", (days, state) => {
    expect(describeScore(row({ recordedAt: new Date(NOW - days * DAY) }), { hasGoogle: false }, NOW).state).toBe(state);
  });

  it("says how old the check is in plain words", () => {
    expect(describeScore(row({ recordedAt: new Date(NOW - 2 * DAY) }), { hasGoogle: false }, NOW).checkedText).toBe("Checked 2 days ago");
    expect(describeScore(row({ recordedAt: new Date(NOW - 3 * 3_600_000) }), { hasGoogle: false }, NOW).checkedText).toBe("Checked 3 hours ago");
    expect(describeScore(row({ recordedAt: new Date(NOW - 20_000) }), { hasGoogle: false }, NOW).checkedText).toBe("Checked just now");
  });

  it("a stale result suggests checking again; a fresh one still allows it", () => {
    expect(describeScore(row({ recordedAt: new Date(NOW - 20 * DAY) }), { hasGoogle: false }, NOW).primaryAction).toBe("recheck");
  });
});

describe("rechecking has a cooldown, and says when it opens", () => {
  it("is not available for a few minutes after a check", () => {
    const v = describeScore(row({ recordedAt: new Date(NOW - 60_000) }), { hasGoogle: false }, NOW);
    expect(v.canRecheck).toBe(false);
    expect(v.recheckAvailableAt).toBe(NOW - 60_000 + 5 * 60_000);
    expect(v.recheckHint).toMatch(/in (about )?4 minutes/i);
  });

  it("opens once the cooldown has passed", () => {
    const v = describeScore(row({ recordedAt: new Date(NOW - 6 * 60_000) }), { hasGoogle: false }, NOW);
    expect(v.canRecheck).toBe(true);
    expect(v.recheckHint).toBeNull();
  });
});

describe("the source no longer hides the difference", () => {
  const read = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), "utf8");
  it.each(["app/(dashboard)/dashboard/DashboardClient.tsx", "app/(dashboard)/businesses/page.tsx"])("%s does not turn a missing score into 0", (file) => {
    const s = read(file);
    expect(s).not.toMatch(/score\??\.total\s*\?\?\s*0/);
    expect(s).not.toMatch(/visibilityScores\[0\]\?\.total\s*\?\?\s*0/);
    expect(s).not.toMatch(/currentScore\s*>\s*0/);
    expect(s).not.toMatch(/currentScore\s*===\s*0/);
  });
});
