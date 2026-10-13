import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { runScan, type ScanReport } from "@/lib/scan";
import { buildView, type ScanApi } from "@/lib/scan-ui/view";
import { GOOD_PAGE, fakeLookup, fakeNet, html, netError, readingGrade, res, type Route } from "../engine/helpers";

// What the result is FOR. A free check that says "100 out of 100" and then has nothing more to say gives
// nobody a reason to come back, and quietly claims more than we measured. These tests pin the honest
// version: the score is labelled as what it is (the basics), the page says what it did not measure,
// and a perfect score leads to the next level and to being watched, not to "nothing to do".

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => undefined, refresh: () => undefined }) }));

const NOW = 1_800_000_000_000;
const ROBOTS = res("User-agent: *\nAllow: /", { type: "text/plain" });
const SITEMAP = res("<urlset></urlset>", { type: "application/xml" });
const site = (page: string | Route): Record<string, Route> => ({
  "https://toss.example/": typeof page === "string" && page !== "hang" ? res(page) : page,
  "https://toss.example/robots.txt": ROBOTS,
  "https://toss.example/sitemap.xml": SITEMAP,
});
const scan = (input: Parameters<typeof runScan>[0], routes: Record<string, Route>) =>
  runScan(input, { fetch: fakeNet(routes).fetch, lookup: fakeLookup().lookup, now: () => NOW, certDaysLeft: async () => 90, timeoutMs: 80, retryDelayMs: 0, confirmMissing: async () => "gone" });
const api = (result: ScanReport | null, over: Partial<ScanApi> = {}): ScanApi => ({ id: "a".repeat(32), status: result ? "done" : "running", result, createdAt: NOW - 30_000, ...over });
const view = (r: ScanReport | null, ctx: Partial<Parameters<typeof buildView>[1]> = {}) => buildView(api(r), { now: NOW, ...ctx });

const PERFECT_ROUTES = { ...site(html({ ld: [{ "@type": "BeautySalon" }], body: '<a href="tel:+2348031234567">c</a><a href="https://x.com/tossspa">x</a>' })), "https://x.com/tossspa": res("ok") };
const perfect = () => scan({ website: "https://toss.example/" }, PERFECT_ROUTES);

describe("the score says what it measures: how ready you are to be found, not 'visibility'", () => {
  it("is labelled as a readiness score, with the number", async () => {
    const v = view(await scan({ website: "https://toss.example/" }, site(GOOD_PAGE)));
    expect(v.score.kind).toBe("number");
    expect(v.score.label).toMatch(/^Readiness score:? \d+ out of 100/i);
  });

  it("never claims a 100 means you are visible, found, or doing well in search", async () => {
    const v = view(await perfect());
    expect(JSON.stringify(v)).not.toMatch(/you are visible|fully visible|perfect visibility|found everywhere|top of google|number one/i);
  });
});

describe("every result says what we did NOT measure, so nobody mistakes the basics for the whole picture", () => {
  const states: Array<[string, () => Promise<ScanReport>]> = [
    ["a healthy site", perfect],
    ["a bare site", () => scan({ website: "https://toss.example/" }, site(html({ title: null, description: null, body: "<p>Hi</p>" })))],
    ["a site that blocks us", () => scan({ website: "https://toss.example/" }, site(res("no", { status: 403 })))],
    ["a dead domain", () => scan({ website: "https://toss.example/" }, { "*": netError("ENOTFOUND") })],
    ["no website", () => scan({ name: "Ada Salon", handles: { instagram: "ada" } }, {})],
    ["a person", () => scan({ name: "Ada", category: "Personal brand" }, {})],
  ];

  it.each(states)("%s: lists what is not measured, in plain words", async (_n, make) => {
    const v = view(await make());
    expect(v.notMeasured.length).toBeGreaterThanOrEqual(4);
    const text = v.notMeasured.join(" | ");
    expect(text).toMatch(/when (people )?search/i);
    expect(text).toMatch(/Google (Maps|listing)/i);
    expect(text).toMatch(/review/i);
    expect(text).toMatch(/AI assistants?/i);
    expect(text).toMatch(/compare/i);
    for (const line of v.notMeasured) expect(readingGrade(/[.!?]$/.test(line) ? line : `${line}.`), line).toBeLessThanOrEqual(9);
  });

  it("is honest about which of those are coming and which need a connection", async () => {
    const v = view(await perfect());
    const text = v.notMeasured.join(" | ");
    expect(text).toMatch(/AI assistants?[^|]*coming soon/i);
    expect(text).toMatch(/Google[^|]*(sign up|connect)/i);
  });

  it("a scan still running or unfinished claims nothing either way", () => {
    expect(view(null).notMeasured).toEqual([]);
  });
});

describe("a perfect score leads to the next level, never to 'nothing to do'", () => {
  it("says the basics are done and what comes next, and names a first next step", async () => {
    const r = await perfect();
    expect(r.fixes).toEqual([]);
    const v = view(r, { name: "Toss Spa", city: "Lagos" });
    expect(v.headline).toMatch(/ready to be found/i);
    expect(v.headline).toMatch(/next/i);
    expect(v.nextStep).not.toBeNull();
    expect(v.nextLevel.length).toBeGreaterThanOrEqual(3);
    expect(v.nextStep!.title).toBe(v.nextLevel[0].title);
  });

  it("the next level is about being found and trusted, with free steps first and a time on each", async () => {
    const v = view(await perfect());
    const titles = v.nextLevel.map((s) => s.title).join(" | ");
    expect(titles).toMatch(/Google Business Profile/i);
    expect(titles).toMatch(/review/i);
    expect(titles).toMatch(/(mention|link|feature)/i);
    expect(v.nextLevel[0].cost).toBe("free");
    const rank = { free: 0, low: 1, paid: 2 } as const;
    expect(v.nextLevel.map((s) => rank[s.cost])).toEqual([...v.nextLevel.map((s) => rank[s.cost])].sort((a, b) => a - b));
    for (const s of v.nextLevel) expect(s.minutes).toBeGreaterThan(0);
  });

  it("while there are basics still to fix, the fixes come first and the next level stays out of the way", async () => {
    const v = view(await scan({ website: "https://toss.example/" }, site(html({ title: null, description: null, body: "<p>Hi</p>" }))));
    expect(v.fixes.length).toBeGreaterThan(0);
    expect(v.nextLevel).toEqual([]);
    expect(v.headline).toMatch(/^Start with this/);
  });
});

describe("the reason to stay: someone watches it for you", () => {
  it("every finished result offers a weekly watch, in words about what it does for the owner", async () => {
    for (const r of [await perfect(), await scan({ name: "Ada", handles: { instagram: "ada" } }, {})]) {
      const v = view(r);
      expect(v.watch.text).toMatch(/every week/i);
      expect(v.watch.text).toMatch(/tell you|let you know/i);
      expect(v.watch.text).toMatch(/(stops|breaks|ends|goes)/i);
      expect(v.watch.free).toBe(true); // the first month of watching is free, so trust comes before payment
      expect(readingGrade(v.watch.text)).toBeLessThanOrEqual(9);
    }
  });

  it("is not offered while the scan is still running", () => {
    expect(view(null).watch.text).toBe("");
  });
});

describe("the front page does not claim more than the scan measures", () => {
  it("labels the example score as a readiness score and says what is not measured", async () => {
    const { default: Home } = await import("@/app/page");
    const page = renderToStaticMarkup(createElement(Home)).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    expect(page).toMatch(/Readiness score/i);
    expect(page).not.toMatch(/Visibility score/i);
    expect(page).toMatch(/not (measured|checked) yet|we do not (yet )?measure/i);
  });
});
