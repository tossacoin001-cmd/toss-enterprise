import { describe, expect, it } from "vitest";
import { runScan, type ScanReport } from "@/lib/scan";
import { FINDING_IDS } from "@/lib/scan/copy";
import { HOWTO } from "@/lib/scan-ui/howto";
import { TOSS_WHATSAPP } from "@/lib/scan-ui/constants";
import { agoText, buildView, progressStep, type ResultView, type ScanApi } from "@/lib/scan-ui/view";
import { GOOD_PAGE, fakeLookup, fakeNet, html, netError, readingGrade, res, type Route } from "../engine/helpers";

// UX-03, UX-11, UX-12, UX-13, XP-03, XP-05, XP-07, NW-08, BG-01, UB-05, UB-07, RT-04, UX-02.
// Reports come from the real engine over a fake internet, so these tests see exactly what a visitor would.

const NOW = 1_800_000_000_000;
const HOUR = 3_600_000;
const ROBOTS = res("User-agent: *\nAllow: /", { type: "text/plain" });
const SITEMAP = res("<urlset></urlset>", { type: "application/xml" });
const site = (page: string | Route): Record<string, Route> => ({
  "https://toss.example/": typeof page === "string" ? res(page) : page,
  "https://toss.example/robots.txt": ROBOTS,
  "https://toss.example/sitemap.xml": SITEMAP,
});

async function report(input: Parameters<typeof runScan>[0], routes: Record<string, Route>): Promise<ScanReport> {
  return runScan(input, { fetch: fakeNet(routes).fetch, lookup: fakeLookup().lookup, now: () => NOW, certDaysLeft: async () => 90, timeoutMs: 80, retryDelayMs: 0 });
}
const api = (result: ScanReport | null, over: Partial<ScanApi> = {}): ScanApi => ({
  id: "a".repeat(32), status: result ? "done" : "running", result, createdAt: NOW - 30_000, ...over,
});
const view = (r: ScanReport | null, ctx: Partial<Parameters<typeof buildView>[1]> = {}, over: Partial<ScanApi> = {}) =>
  buildView(api(r, over), { now: NOW, ...ctx });

const SCENARIOS: Array<[string, ResultView["state"], () => Promise<ScanReport>]> = [
  ["a healthy site", "normal", () => report({ website: "https://toss.example/" }, site(GOOD_PAGE))],
  ["a bare site", "normal", () => report({ website: "https://toss.example/" }, site(html({ title: null, description: null, viewport: false, h1: null, canonical: null, body: "<p>Hi</p>" })))],
  ["a site that blocks us", "could_not_open", () => report({ website: "https://toss.example/" }, site(res("no", { status: 403 })))],
  ["a timeout", "could_not_open", () => report({ website: "https://toss.example/" }, site("hang" as unknown as string))],
  ["a dead domain", "dead_domain", () => report({ website: "https://toss.example/" }, { "*": netError("ENOTFOUND") })],
  ["an expired certificate", "certificate", () => report({ website: "toss.example" }, { "*": netError("CERT_HAS_EXPIRED") })],
  ["a server error", "normal", () => report({ website: "https://toss.example/" }, site(res("e", { status: 500 })))],
  ["no website", "no_website", () => report({ name: "Toss Spa", city: "Lagos", handles: { instagram: "tossspa" }, whatsapp: "0803 123 4567" }, {})],
];

describe("UX-03: every kind of result has a screen of its own", () => {
  it.each(SCENARIOS)("%s", async (_n, state, make) => {
    const v = view(await make(), { name: "Toss Spa", city: "Lagos" });
    expect(v.state).toBe(state);
    expect(v.headline.length).toBeGreaterThan(10);
    expect(v.signUp.show).toBe(true);
  });

  it("a scan still running shows progress, not an empty result", () => {
    const v = view(null);
    expect(v.state).toBe("running");
    expect(v.fixes).toEqual([]);
    expect(v.signUp.show).toBe(false);
  });

  it("RL-03: an incomplete scan says so, offers a retry and shows no made-up score", () => {
    const v = view(null, {}, { status: "incomplete" });
    expect(v).toMatchObject({ state: "incomplete", retry: true, nextStep: null });
    expect(v.score.kind).toBe("not_scored");
    expect(v.headline).toMatch(/try again|could not finish/i);
  });

  it("an answer that is done but empty is treated as incomplete, never a crash", () => {
    expect(view(null, {}, { status: "done" }).state).toBe("incomplete");
  });
});

describe("XP-07: the first screen names the one most valuable next step", () => {
  it("is the top fix, named in the headline, with time and a reason", async () => {
    const r = await report({ website: "https://toss.example/" }, site(html({ title: null, description: null, viewport: false, body: "<p>Hi</p>" })));
    const v = view(r, { name: "Toss Spa", city: "Lagos" });
    expect(v.nextStep).not.toBeNull();
    expect(v.nextStep!.title).toBe(r.topFixes[0].title);
    expect(v.headline).toContain(v.nextStep!.title);
    expect(v.nextStep!.minutes).toBeGreaterThan(0);
    expect(v.nextStep!.why.length).toBeGreaterThan(10);
  });

  it("with nothing to fix, says so warmly instead of inventing work", async () => {
    const v = view(await report({ website: "https://toss.example/" }, site(GOOD_PAGE)));
    expect(v.nextStep).toBeNull();
    expect(v.fixes.filter((f) => f.id.startsWith("page."))).toEqual([]);
    expect(v.headline).not.toMatch(/undefined|null/);
  });
});

describe("NW-08, NW-06: no website yet never shows a bare, discouraging zero", () => {
  it("shows points available, what is already verified and a first free step", async () => {
    const v = view(await SCENARIOS[7][2](), { name: "Toss Spa", city: "Lagos" });
    expect(v.score.kind).toBe("points_available");
    if (v.score.kind === "points_available") {
      expect(v.score.points).toBeGreaterThan(0);
      expect(v.score.label).not.toMatch(/\b0\s*(\/|out of)\s*100/);
    }
    expect(v.startHere!.length).toBeGreaterThanOrEqual(4);
    expect(v.nextStep!.title).toBe(v.startHere![0].title);
    expect(v.startHere![0].cost).toBe("free");
  });

  it("a personal brand or creator gets wording that fits: no customers walking in", async () => {
    const r = await report({ name: "Ada Creates", handles: { x: "adacreates" }, category: "Personal brand" }, { "https://x.com/adacreates": res("ok") });
    const v = view(r, { name: "Ada Creates", category: "Personal brand" });
    const text = JSON.stringify(v);
    expect(text).not.toMatch(/walk[- ]in|opening hours|your shop|your branch/i);
  });
});

describe("BG-01, UB-05: personal and not tied to one country", () => {
  it("uses the business name and city in the title", async () => {
    const v = view(await SCENARIOS[0][2](), { name: "Toss Spa", city: "Lagos" });
    expect(v.title).toContain("Toss Spa");
    expect(v.title).toContain("Lagos");
  });

  it("falls back to the website name, never a blank or a placeholder word", async () => {
    const v = view(await SCENARIOS[0][2]());
    expect(v.title).toMatch(/toss\.example/);
    expect(v.title).not.toMatch(/undefined|null|\{|\[/);
  });

  it("a foreign business sees no Nigeria-only assumptions", async () => {
    const r = await report({ website: "https://toss.example/" }, site(html({ title: null, body: "<p>Hi</p>" })));
    const text = JSON.stringify(view(r, { name: "Thames Bakery", city: "London" })).replace(/wa\.me\/\d+/g, "");
    expect(text).not.toMatch(/Nigeria|Lagos|naira|₦|\bNG\b/i);
  });
});

describe("UX-12, UX-13, PV-07: nothing is locked, and sign-up comes after the result", () => {
  it("shows the whole result with no locked, upgrade or premium wording anywhere", async () => {
    for (const [, , make] of SCENARIOS) {
      const v = view(await make(), { name: "Toss Spa", city: "Lagos" });
      expect(JSON.stringify(v)).not.toMatch(/locked|unlock|upgrade|paywall|premium|members only/i);
    }
  });

  it("offers sign-up to save, track and get the weekly email, is dismissible, and never needs an email", async () => {
    const v = view(await SCENARIOS[0][2]());
    expect(v.signUp).toMatchObject({ show: true, dismissible: true, emailRequired: false, cardRequired: false });
    expect(v.signUp.text).toMatch(/save/i);
    expect(v.signUp.text).toMatch(/weekly/i);
  });

  it("every fix is visible in full, not only the first", async () => {
    const r = await report({ website: "https://toss.example/" }, site(html({ title: null, description: null, viewport: false, h1: null, canonical: null, body: "<p>Hi</p>" })));
    const v = view(r);
    expect(v.fixes.length).toBe(r.fixes.length);
    for (const f of v.fixes) expect([f.title, f.why, f.fix].every((t) => t.length > 5)).toBe(true);
  });
});

describe("XP-05: every fix offers do it yourself and do it for me", () => {
  it("has two to five plain steps, and a prefilled WhatsApp message to Toss", async () => {
    const r = await report({ website: "https://toss.example/" }, site(html({ title: null, description: null, viewport: false, body: "<p>Hi</p>" })));
    const v = view(r, { name: "Toss Spa", city: "Lagos" });
    for (const f of v.fixes) {
      expect(f.steps.length, f.id).toBeGreaterThanOrEqual(2);
      expect(f.steps.length, f.id).toBeLessThanOrEqual(5);
      expect(f.doItForMe, f.id).toMatch(new RegExp(`^https://wa\\.me/${TOSS_WHATSAPP}\\?text=`));
      const text = decodeURIComponent(f.doItForMe!.split("?text=")[1]);
      expect(text).toContain(f.title);
      expect(text).toContain("Toss Spa");
      expect(f.doItForMe!.length).toBeLessThan(900);
    }
  });

  it("every finding the engine can produce has a how-to of two to five short steps in plain words", () => {
    for (const id of FINDING_IDS) {
      const steps = HOWTO[id];
      expect(steps, `no how-to for ${id}`).toBeDefined();
      expect(steps.length, id).toBeGreaterThanOrEqual(2);
      expect(steps.length, id).toBeLessThanOrEqual(5);
      for (const s of steps) {
        expect(s.length, `${id}: ${s}`).toBeLessThanOrEqual(140);
        expect(readingGrade(s), `${id}: ${s}`).toBeLessThanOrEqual(8);
      }
    }
  });

  it("a name with quotes, angle brackets or a huge length stays safe and short in the message", async () => {
    const r = await report({ website: "https://toss.example/" }, site(html({ title: null, body: "<p>Hi</p>" })));
    const v = view(r, { name: `<script>alert(1)</script> "Spa" ${"x".repeat(5000)}` });
    for (const f of v.fixes) {
      expect(f.doItForMe!.length).toBeLessThan(900);
      expect(f.doItForMe).not.toMatch(/<script/i);
    }
    expect(v.title.length).toBeLessThan(200);
  });
});

describe("XP-03, BG-07: plain, warm language on every screen", () => {
  const BANNED = [/\bdown\b/i, /unreachable/i, /you don'?t have/i, /\bfail(ed|ure|s)?\b/i, /\bdead\b/i, /\bterrible\b/i, /\bawful\b/i, /undefined|\[object|NaN|\{\{/];
  const JARGON = /\b(meta|canonical|schema|seo|json-ld|html|dns|ssl|tls|viewport|robots\.txt|sitemap|favicon|api|http)\b/i;

  /** The words a visitor reads on the screen (links are not words). */
  const words = (v: ResultView): string[] => {
    const out: string[] = [v.title, v.headline, v.score.kind === "number" ? v.score.label : "", v.score.kind !== "number" ? v.score.label : ""];
    out.push(v.signUp.text, ...v.notices, v.couldNotNote ?? "");
    if (v.nextStep) out.push(v.nextStep.title, v.nextStep.why);
    for (const f of v.fixes) out.push(...f.steps);
    for (const c of v.couldNot) out.push(c.title, c.why);
    return out.filter(Boolean);
  };

  it.each(SCENARIOS)("%s: no banned words, no jargon, reads at grade 9 or below", async (_n, _s, make) => {
    const v = view(await make(), { name: "Toss Spa", city: "Lagos" });
    for (const t of words(v)) {
      for (const re of BANNED) expect(t, `${re}`).not.toMatch(re);
      expect(t, "jargon").not.toMatch(JARGON);
      expect(readingGrade(t.endsWith(".") || t.endsWith("?") || t.endsWith("!") ? t : `${t}.`), t).toBeLessThanOrEqual(9);
    }
  });

  it("anything we could not check says it is not counted, and never blames the owner", async () => {
    const v = view(await SCENARIOS[2][2](), { name: "Toss Spa", city: "Lagos" });
    expect(v.couldNotNote).toMatch(/not (counted|in your score)/i);
    expect(JSON.stringify(v)).not.toMatch(/your fault|you should have|you forgot/i);
    expect(v.score.kind).toBe("not_scored");
  });

  it("UB-07: always says the scan only looks at public information", async () => {
    for (const [, , make] of SCENARIOS) expect(view(await make()).notices.join(" ")).toMatch(/public/i);
  });

  it("EN-16: a page built with JavaScript says some things may have been missed", async () => {
    const spa = `<!doctype html><html lang="en"><head><title>Toss Spa</title><meta name="viewport" content="width=device-width"></head><body><div id="root"></div>${'<script src="/a.js"></script>'.repeat(4)}</body></html>`;
    const v = view(await report({ website: "https://toss.example/" }, site(spa)));
    expect(v.notices.join(" ")).toMatch(/may have missed|could be there/i);
  });
});

describe("UX-11: a saved result says how old it is, and when a rescan opens", () => {
  it.each([
    [10_000, "just now", false],
    [5 * 60_000, "5 minutes ago", false],
    [3 * HOUR, "3 hours ago", false],
    [23 * HOUR, "23 hours ago", false],
    [25 * HOUR, "1 day ago", true],
    [3 * 24 * HOUR, "3 days ago", true],
  ])("%i ms old is '%s' (rescan open: %s)", async (age, text, can) => {
    const v = view(await SCENARIOS[0][2](), {}, { createdAt: NOW - age });
    expect(v.ago).toBe(text);
    expect(v.canRescan).toBe(can);
    expect(agoText(NOW - age, NOW)).toBe(text);
  });

  it("a clock a little ahead of ours is 'just now', never negative", () => {
    expect(agoText(NOW + 5000, NOW)).toBe("just now");
  });
});

describe("UX-02, RT-04: the progress screen always moves and never claims to be done", () => {
  it("shows a first step at once", () => {
    expect(progressStep(0).label.length).toBeGreaterThan(5);
  });

  it("changes its words at least every 3 seconds for a full 30 seconds", () => {
    let last = progressStep(0).label;
    let since = 0;
    for (let t = 250; t <= 30_000; t += 250) {
      const label = progressStep(t).label;
      if (label === last) since += 250;
      else {
        since = 0;
        last = label;
      }
      expect(since, `still '${label}' at ${t}ms`).toBeLessThanOrEqual(3000);
    }
  });

  it("never says it has finished, and never goes backwards", () => {
    let index = -1;
    for (let t = 0; t <= 60_000; t += 500) {
      const p = progressStep(t);
      expect(p.label).not.toMatch(/\b(done|finished|complete|ready|your score is)\b/i);
      expect(p.index).toBeGreaterThanOrEqual(index);
      index = p.index;
    }
  });
});
