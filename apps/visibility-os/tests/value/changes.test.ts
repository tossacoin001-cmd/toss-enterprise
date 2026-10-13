import { describe, expect, it } from "vitest";
import type { Finding, ScanReport } from "@/lib/scan";
import { FINDING_IDS, entryMeta, variantFor } from "@/lib/scan/copy";
import { compareScans } from "@/lib/value/changes";
import { readingGrade } from "../engine/helpers";

// The weekly watch: what changed since last time, said plainly. This is the thing worth paying for, so
// it must be right in both directions: never miss a real break, and never cry wolf over one bad moment.

const f = (id: string, state: Finding["state"], over: Partial<Finding> = {}): Finding => {
  const meta = entryMeta(id);
  const v = variantFor(id, { state, cause: id === "site.reachable" && state === "missing" ? "domain_not_found" : undefined, detail: id === "social.verified" && state === "missing" ? "broken_link" : undefined });
  return { id, group: meta.group, state, priority: meta.priority, title: v.title, why: v.why, fix: v.fix, minutes: meta.minutes, points: meta.points, earned: state === "found" ? meta.points : 0, ...over };
};
const report = (findings: Finding[]): ScanReport => {
  const counted = findings.filter((x) => x.state !== "could_not_check");
  const web = counted.filter((x) => x.group === "website");
  const pct = (xs: Finding[]) => (xs.reduce((n, x) => n + x.points, 0) ? Math.round((xs.reduce((n, x) => n + x.earned, 0) / xs.reduce((n, x) => n + x.points, 0)) * 100) : null);
  const website = pct(web);
  return {
    path: "website", findings, fixes: findings.filter((x) => x.state === "missing"), topFixes: [], couldNotCheck: findings.filter((x) => x.state === "could_not_check").map((x) => x.id),
    score: { website, social: null, total: website, earned: 0, possible: 200, pointsAvailable: 0 },
  };
};
const ALL = FINDING_IDS.filter((id) => !["site.none", "google.profile", "site.cert_expiring"].includes(id));
const healthy = () => report(ALL.map((id) => f(id, "found")));
const withChange = (id: string, state: Finding["state"], extra: Finding[] = []) => report([...ALL.map((x) => f(x, x === id ? state : "found")), ...extra]);

describe("nothing changed: nothing to say", () => {
  it("is quiet, and the score does not move", () => {
    const c = compareScans(healthy(), healthy());
    expect(c.alerts).toEqual([]);
    expect(c.good).toEqual([]);
    expect(c.notes).toEqual([]);
    expect(c.scoreDelta).toBe(0);
  });
});

describe("a real break is an alert, said plainly", () => {
  it.each(["site.reachable", "site.https", "page.title", "trust.contact", "social.verified"])("%s found -> missing is an alert", (id) => {
    const c = compareScans(healthy(), withChange(id, "missing"));
    expect(c.alerts).toHaveLength(1);
    expect(c.alerts[0]).toMatchObject({ id, kind: "got_worse" });
    expect(c.alerts[0].text).toContain(f(id, "missing").title);
    expect(c.scoreDelta).toBeLessThan(0);
  });

  it("the most serious breaks come first", () => {
    const next = report(ALL.map((id) => f(id, ["page.canonical", "site.reachable"].includes(id) ? "missing" : "found")));
    const c = compareScans(healthy(), next);
    expect(c.alerts.map((a) => a.id)).toEqual(["site.reachable", "page.canonical"]);
  });

  it("every alert says it will be double-checked before anyone is told, so one bad moment never causes a scare", () => {
    const c = compareScans(healthy(), withChange("site.reachable", "missing"));
    expect(c.alerts.every((a) => a.recheckFirst === true)).toBe(true);
  });
});

describe("what we could not check is never an alert and never changes the score", () => {
  it("found -> could not check becomes a quiet note, and the last result is kept", () => {
    const c = compareScans(healthy(), withChange("site.reachable", "could_not_check"));
    expect(c.alerts).toEqual([]);
    expect(c.notes).toHaveLength(1);
    expect(c.notes[0].text).toMatch(/could not check/i);
    expect(c.notes[0].text).toMatch(/last (result|time)/i);
    expect(c.scoreDelta).toBe(0);
  });

  it("the score change is worked out only from checks that could be made both times", () => {
    const next = report(ALL.map((id) => f(id, id === "speed" ? "could_not_check" : id === "page.title" ? "missing" : "found")));
    const c = compareScans(healthy(), next);
    const withoutSpeed = ALL.filter((id) => id !== "speed");
    const pts = (ids: string[]) => ids.reduce((n, id) => n + entryMeta(id).points, 0);
    const lost = entryMeta("page.title").points;
    expect(c.scoreDelta).toBe(Math.round(((pts(withoutSpeed) - lost) / pts(withoutSpeed)) * 100) - 100);
  });

  it("a site that stopped answering to our checks altogether is a note, not 'your whole site broke'", () => {
    const next = report(ALL.map((id) => f(id, "could_not_check")));
    const c = compareScans(healthy(), next);
    expect(c.alerts).toEqual([]);
    expect(c.notes.length).toBeGreaterThan(0);
    expect(c.scoreDelta).toBeNull();
  });
});

describe("good news is told too, because a fix that nobody sees does not build trust", () => {
  it("missing -> found is 'fixed', and the score goes up", () => {
    const c = compareScans(withChange("page.description", "missing"), healthy());
    expect(c.good).toHaveLength(1);
    expect(c.good[0]).toMatchObject({ id: "page.description", kind: "got_better" });
    expect(c.good[0].text).toMatch(/fixed|now/i);
    expect(c.scoreDelta).toBeGreaterThan(0);
  });

  it("something still missing is not repeated every week as if it were new", () => {
    const c = compareScans(withChange("page.canonical", "missing"), withChange("page.canonical", "missing"));
    expect(c.alerts).toEqual([]);
    expect(c.good).toEqual([]);
  });
});

describe("a certificate that is about to end is a warning before it hurts", () => {
  it("a new 'ends soon' finding is a heads-up, not a break", () => {
    const next = withChange("site.https", "found", [f("site.cert_expiring", "missing")]);
    const c = compareScans(healthy(), next);
    expect(c.alerts).toHaveLength(1);
    expect(c.alerts[0]).toMatchObject({ id: "site.cert_expiring", kind: "coming_up" });
    expect(c.alerts[0].text).toMatch(/ends soon|this week/i);
  });
});

describe("the words are plain, calm and never blame", () => {
  const BANNED = [/\bdown\b/i, /unreachable/i, /\bfail(ed|ure|s)?\b/i, /\bdead\b/i, /\bterrible\b/i, /your fault/i, /undefined|null|NaN|\[object/];
  it("alerts, good news and notes use plain words", () => {
    const sets = [
      compareScans(healthy(), withChange("site.reachable", "missing")),
      compareScans(healthy(), withChange("speed", "could_not_check")),
      compareScans(withChange("page.title", "missing"), healthy()),
    ];
    for (const c of sets) {
      for (const line of [...c.alerts, ...c.good, ...c.notes]) {
        for (const re of BANNED) expect(line.text, `${re}`).not.toMatch(re);
        expect(readingGrade(/[.!?]$/.test(line.text) ? line.text : `${line.text}.`), line.text).toBeLessThanOrEqual(10);
      }
    }
  });
});
