import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Finding, ScanReport } from "@/lib/scan";
import { FINDING_IDS, entryMeta, variantFor } from "@/lib/scan/copy";
import { slimFindings } from "@/lib/value/changes";

// The weekly watch end to end, with the database and the scan stood in for: last week's findings are
// remembered, this week's are compared, a break is looked at twice before anyone is told, and the
// email says what changed. VW-01..VW-08.

const db = {
  visibilityScore: { create: vi.fn((args: { data: Record<string, unknown> }) => ({ id: "new", recordedAt: new Date(), ...args.data })) },
  actionItem: { findMany: vi.fn(async () => []), deleteMany: vi.fn(() => ({})), createMany: vi.fn(() => ({})), update: vi.fn(() => ({})) },
  $transaction: vi.fn(async (ops: unknown[]) => Promise.all(ops)),
};
vi.mock("@/lib/db", () => ({ db }));

const scoreBusiness = vi.fn();
vi.mock("@/lib/scoring", () => ({ scoreBusiness: (...a: unknown[]) => scoreBusiness(...a) }));

const { runAndPersistScore } = await import("@/lib/run-weekly-score");
const { buildDigestEmail } = await import("@/lib/weekly-digest");

const IDS = FINDING_IDS.filter((id) => !["site.none", "google.profile", "site.cert_expiring"].includes(id));
const f = (id: string, state: Finding["state"]): Finding => {
  const meta = entryMeta(id);
  const v = variantFor(id, { state, cause: id === "site.reachable" && state === "missing" ? "domain_not_found" : undefined, detail: id === "social.verified" && state === "missing" ? "broken_link" : undefined });
  return { id, group: meta.group, state, priority: meta.priority, title: v.title, why: v.why, fix: v.fix, minutes: meta.minutes, points: meta.points, earned: state === "found" ? meta.points : 0 };
};
const report = (broken: string[] = [], unchecked: string[] = []): ScanReport =>
  ({
    path: "website",
    findings: IDS.map((id) => f(id, broken.includes(id) ? "missing" : unchecked.includes(id) ? "could_not_check" : "found")),
    fixes: [], topFixes: [], couldNotCheck: [], score: { website: 100, social: 100, total: 100, earned: 200, possible: 200, pointsAvailable: 0 },
  }) as ScanReport;
const result = (r: ScanReport) => ({ total: 90, googleScore: 0, socialScore: 100, websiteScore: 100, reviewCount: 0, avgRating: 0, actionItems: [], report: r });

const business = (previousReport: ScanReport | null) =>
  ({
    id: "b1", name: "Toss Spa", category: null, city: null, googlePlaceId: null, phoneNumber: null, website: "https://toss.example", instagramHandle: null,
    visibilityScores: previousReport
      ? [{ id: "p", total: 90, googleScore: 0, socialScore: 100, websiteScore: 100, reviewCount: 0, avgRating: 0, recordedAt: new Date(), findings: slimFindings(previousReport.findings) }]
      : [],
  }) as unknown as Parameters<typeof runAndPersistScore>[0];

const FAST = { recheckDelayMs: 0 };
beforeEach(() => { scoreBusiness.mockReset(); db.visibilityScore.create.mockClear(); });

describe("VW-01: this week's findings are remembered for next week", () => {
  it("saves a compact copy of every finding with the score", async () => {
    scoreBusiness.mockResolvedValue(result(report()));
    await runAndPersistScore(business(null), undefined, FAST);
    const data = db.visibilityScore.create.mock.calls[0][0].data as { findings: Array<{ id: string; state: string; title: string }> };
    expect(data.findings).toHaveLength(IDS.length);
    expect(data.findings[0]).toMatchObject({ id: expect.any(String), state: "found", title: expect.any(String) });
  });
});

describe("VW-02: the first week has nothing to compare, so it says nothing is new", () => {
  it("no previous findings means no changes and no second look", async () => {
    scoreBusiness.mockResolvedValue(result(report()));
    const r = await runAndPersistScore(business(null), undefined, FAST);
    expect(r.changes).toBeNull();
    expect(scoreBusiness).toHaveBeenCalledTimes(1);
  });
});

describe("VW-03: a quiet week stays quiet", () => {
  it("same findings: no alerts, one scan only", async () => {
    scoreBusiness.mockResolvedValue(result(report()));
    const r = await runAndPersistScore(business(report()), undefined, FAST);
    expect(r.changes).toMatchObject({ alerts: [], good: [], notes: [] });
    expect(scoreBusiness).toHaveBeenCalledTimes(1);
  });
});

describe("VW-04: a break is looked at twice before anyone is told", () => {
  it("a second look that finds it fine means no alert (one bad moment)", async () => {
    scoreBusiness.mockResolvedValueOnce(result(report(["site.reachable"]))).mockResolvedValueOnce(result(report()));
    const r = await runAndPersistScore(business(report()), undefined, FAST);
    expect(scoreBusiness).toHaveBeenCalledTimes(2);
    expect(r.changes!.alerts).toEqual([]);
    // and what is saved is the second, confirmed look
    const data = db.visibilityScore.create.mock.calls[0][0].data as { findings: Array<{ id: string; state: string }> };
    expect(data.findings.find((x) => x.id === "site.reachable")!.state).toBe("found");
  });

  it("a second look that finds it still broken is a real alert", async () => {
    scoreBusiness.mockResolvedValue(result(report(["site.reachable"])));
    const r = await runAndPersistScore(business(report()), undefined, FAST);
    expect(scoreBusiness).toHaveBeenCalledTimes(2);
    expect(r.changes!.alerts.map((a) => a.id)).toEqual(["site.reachable"]);
  });

  it("the second look can be switched off, for the on-demand button that must answer quickly", async () => {
    scoreBusiness.mockResolvedValue(result(report(["site.reachable"])));
    await runAndPersistScore(business(report()), undefined, { recheck: false });
    expect(scoreBusiness).toHaveBeenCalledTimes(1);
  });
});

describe("VW-05: what we could not check is never an alert", () => {
  it("a site that blocked us this time is a quiet note and one scan", async () => {
    scoreBusiness.mockResolvedValue(result(report([], ["site.reachable"])));
    const r = await runAndPersistScore(business(report()), undefined, FAST);
    expect(r.changes!.alerts).toEqual([]);
    expect(r.changes!.notes.length).toBe(1);
    expect(scoreBusiness).toHaveBeenCalledTimes(1);
  });
});

describe("VW-06: the weekly email says what changed, most important first", () => {
  const entry = (changes: ReturnType<typeof emptyChanges>) => ({ name: "Toss Spa", total: 80, delta: { scoreDelta: -10, reviewDelta: 0, ratingDelta: 0 }, topActionItem: null, changes });
  const emptyChanges = () => ({ alerts: [] as Array<{ id: string; kind: "got_worse"; text: string; priority: "HIGH" }>, good: [] as Array<{ id: string; kind: "got_better"; text: string; priority: "LOW" }>, notes: [] as Array<{ id: string; kind: "could_not_check_now"; text: string; priority: "LOW" }>, scoreDelta: -10 as number | null });
  const links = { dashboardUrl: "https://tossvisibilityos.com/dashboard", unsubscribeUrl: "https://tossvisibilityos.com/u" };

  it("puts alerts first, with a subject that says something needs attention", () => {
    const c = emptyChanges();
    c.alerts.push({ id: "site.reachable", kind: "got_worse", text: "Something changed: This web address does not exist.", priority: "HIGH" });
    c.good.push({ id: "page.title", kind: "got_better", text: "Fixed: Your page has a title.", priority: "LOW" });
    const { subject, text } = buildDigestEmail([entry(c)], links);
    expect(subject).toMatch(/needs your attention/i);
    expect(text.indexOf("Something changed")).toBeGreaterThan(-1);
    expect(text.indexOf("Something changed")).toBeLessThan(text.indexOf("Fixed:"));
    expect(text.indexOf("Something changed")).toBeLessThan(text.indexOf("readiness score"));
  });

  it("tells good news and notes in their own words", () => {
    const c = emptyChanges();
    c.good.push({ id: "page.title", kind: "got_better", text: "Fixed: Your page has a title.", priority: "LOW" });
    c.notes.push({ id: "speed", kind: "could_not_check_now", text: "We could not time your site fairly this time. We kept your last result.", priority: "LOW" });
    const { subject, text } = buildDigestEmail([entry(c)], links);
    expect(subject).not.toMatch(/needs your attention/i);
    expect(text).toMatch(/Good news/i);
    expect(text).toMatch(/We could not time your site fairly/);
  });

  it("calls the number the readiness score, never the visibility score", () => {
    const { text } = buildDigestEmail([entry(emptyChanges())], links);
    expect(text).not.toMatch(/visibility score/i);
  });

  it("without any changes the email reads as it did before", () => {
    const { text } = buildDigestEmail([{ ...entry(emptyChanges()), changes: undefined }], links);
    expect(text).toMatch(/holding steady|readiness score/i);
  });
});
