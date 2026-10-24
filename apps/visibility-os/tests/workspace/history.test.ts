import { describe, expect, it } from "vitest";
import { buildHistory, coverageOf } from "@/lib/workspace/history";

// Reports compare like with like: a change is worked out only from checks that could be made both times,
// and an older check that saved no details is "not comparable", never a made-up change. Handoff section 4F.

const DAY = 86_400_000;
const T = Date.parse("2026-10-23T10:00:00Z");
const f = (id: string, state: string, points: number) => ({ id, group: "website", state, points, earned: state === "found" ? points : 0, title: id, priority: "MEDIUM" });
const row = (id: string, daysAgo: number, total: number, findings: unknown) => ({ id, total, recordedAt: new Date(T - daysAgo * DAY), findings });

describe("coverageOf", () => {
  it("is the share of check points that could be made", () => {
    expect(coverageOf([f("a", "found", 60), f("b", "could_not_check", 20), f("c", "missing", 20)])).toBe(80);
  });
  it("is null when nothing was recorded", () => {
    expect(coverageOf(null)).toBeNull();
    expect(coverageOf([])).toBeNull();
    expect(coverageOf("junk")).toBeNull();
  });
});

describe("buildHistory", () => {
  it("lists newest first, with a plain date in Lagos time", () => {
    const h = buildHistory([row("new", 0, 80, [f("a", "found", 100)]), row("old", 7, 70, [f("a", "missing", 100)])]);
    expect(h.map((x) => x.id)).toEqual(["new", "old"]);
    expect(h[0].dateText).toBe("23 Oct 2026");
  });

  it("the oldest check is the first check, with no change to report", () => {
    const h = buildHistory([row("only", 0, 80, [f("a", "found", 100)])]);
    expect(h[0].change).toBeNull();
    expect(h[0].changeText).toBe("First check");
  });

  it("an improvement is 'Up', a drop is 'Down', and no movement is 'No change'", () => {
    const up = buildHistory([row("n", 0, 90, [f("a", "found", 50), f("b", "found", 50)]), row("o", 7, 50, [f("a", "found", 50), f("b", "missing", 50)])]);
    expect(up[0].change).toBe(50);
    expect(up[0].changeText).toBe("Up 50 points");
    const down = buildHistory([row("n", 0, 50, [f("a", "found", 50), f("b", "missing", 50)]), row("o", 7, 90, [f("a", "found", 50), f("b", "found", 50)])]);
    expect(down[0].changeText).toBe("Down 50 points");
    const same = buildHistory([row("n", 0, 50, [f("a", "found", 100)]), row("o", 7, 50, [f("a", "found", 100)])]);
    expect(same[0].changeText).toBe("No change");
  });

  it("a check that could not be made is left out of the comparison, so it never looks like a drop", () => {
    const h = buildHistory([row("n", 0, 50, [f("a", "found", 50), f("b", "could_not_check", 50)]), row("o", 7, 100, [f("a", "found", 50), f("b", "found", 50)])]);
    expect(h[0].changeText).toBe("No change");
  });

  it("when nothing could be compared, says so instead of inventing a number", () => {
    const h = buildHistory([row("n", 0, 50, [f("a", "could_not_check", 100)]), row("o", 7, 100, [f("a", "found", 100)])]);
    expect(h[0].change).toBeNull();
    expect(h[0].changeText).toMatch(/not comparable/i);
  });

  it("an older check that saved no details is 'not comparable', and says why", () => {
    const h = buildHistory([row("n", 0, 80, [f("a", "found", 100)]), row("o", 7, 40, null)]);
    expect(h[0].change).toBeNull();
    expect(h[0].changeText).toMatch(/not comparable/i);
    expect(h[1].changeText).toBe("First check");
  });

  it("shows coverage per check, and 'not recorded' as null for an old one", () => {
    const h = buildHistory([row("n", 0, 80, [f("a", "found", 60), f("b", "could_not_check", 40)]), row("o", 7, 40, null)]);
    expect(h[0].coverage).toBe(60);
    expect(h[1].coverage).toBeNull();
  });

  it("copes with no rows, and with damaged findings", () => {
    expect(buildHistory([])).toEqual([]);
    expect(() => buildHistory([row("n", 0, 80, { not: "an array" }), row("o", 7, 70, [null, 3, "x"])])).not.toThrow();
  });

  it("a genuine zero total stays a zero", () => {
    const h = buildHistory([row("n", 0, 0, [f("a", "missing", 100)])]);
    expect(h[0].total).toBe(0);
  });
});
