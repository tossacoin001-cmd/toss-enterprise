import { describe, expect, it } from "vitest";
import { runScan, type ScanReport } from "@/lib/scan";
import { GOOD_PAGE, fakeLookup, fakeNet, html, netError, readingGrade, redirect, res, type Route } from "./helpers";

// SC-03, SC-04, SC-06, SC-08, NW-02, NW-03, EN-12, EN-14, EN-15, EN-16, EN-21,
// EN-23, XP-04, UX-04, SE-15. The whole scan, offline, one scenario per test.

const ROBOTS = res("User-agent: *\nAllow: /\nSitemap: https://toss.example/sitemap.xml", { type: "text/plain" });
const SITEMAP = res('<?xml version="1.0"?><urlset></urlset>', { type: "application/xml" });
const SOFT_404 = res(html({ title: "Page not found" }), { status: 200 });

type Routes = Record<string, Route | Route[]>;
const site = (page: string | Response | Route, extra: Routes = {}): Routes => ({
  "https://toss.example/": typeof page === "string" && page !== "hang" ? res(page) : page,
  "https://toss.example/robots.txt": ROBOTS,
  "https://toss.example/sitemap.xml": SITEMAP,
  ...extra,
});

async function scan(input: Parameters<typeof runScan>[0], routes: Routes, deps: Partial<NonNullable<Parameters<typeof runScan>[1]>> = {}) {
  const net = fakeNet(routes);
  const dns = fakeLookup();
  const clock = { t: 1_800_000_000_000 };
  const report = await runScan(input, {
    fetch: net.fetch, lookup: dns.lookup, now: () => clock.t, certDaysLeft: async () => 90, timeoutMs: 80, retryDelayMs: 0, ...deps,
  });
  return { report, net, clock };
}
const f = (r: ScanReport, id: string) => {
  const found = r.findings.find((x) => x.id === id);
  if (!found) throw new Error(`no finding ${id}; have ${r.findings.map((x) => x.id).join(", ")}`);
  return found;
};
const WEBSITE = { website: "https://toss.example/" };

describe("a complete, healthy site", () => {
  it("scores 100 with nothing missing and nothing unchecked", async () => {
    const { report } = await scan(WEBSITE, site(GOOD_PAGE));
    expect(report.path).toBe("website");
    expect(report.score.website).toBe(100);
    expect(report.findings.filter((x) => x.group === "website" && x.state !== "found")).toEqual([]);
    expect(report.couldNotCheck).toEqual([]);
    expect(report.site).toMatchObject({ finalUrl: "https://toss.example/", status: 200 });
  });

  it("SC-04: the website checks are worth exactly 100 points and the social checks exactly 100", async () => {
    const { report } = await scan(WEBSITE, site(GOOD_PAGE));
    const sum = (g: string) => report.findings.filter((x) => x.group === g).reduce((n, x) => n + x.points, 0);
    expect(sum("website")).toBe(100);
    expect(sum("social")).toBe(100);
    expect(new Set(report.findings.map((x) => x.id)).size).toBe(report.findings.length);
  });

  it("EN-21: the same site scanned twice gives identical findings", async () => {
    const one = await scan(WEBSITE, site(GOOD_PAGE));
    const two = await scan(WEBSITE, site(GOOD_PAGE));
    expect(two.report).toEqual(one.report);
  });
});

describe("things that are missing", () => {
  it("reports a missing description as missing, worth its points, and lowers the score by exactly those", async () => {
    const { report } = await scan(WEBSITE, site(html({ description: null, ld: [{ "@type": "BeautySalon" }], body: '<a href="tel:+2348031234567">c</a>' })));
    expect(f(report, "page.description")).toMatchObject({ state: "missing", earned: 0, points: 10, priority: "MEDIUM" });
    expect(report.score.website).toBe(90);
  });

  it.each([
    ["page.title", { title: null }],
    ["page.mobile", { viewport: false }],
    ["page.heading", { h1: null }],
    ["page.canonical", { canonical: null }],
  ])("%s", async (id, opts) => {
    const { report } = await scan(WEBSITE, site(html({ ld: [{ "@type": "Dentist" }], body: '<a href="tel:+2348031234567">c</a>', ...opts })));
    expect(f(report, id).state).toBe("missing");
    expect(f(report, id).earned).toBe(0);
  });

  it("a site with no phone, WhatsApp or email shows trust.contact as missing; with a Nigerian number in the text it is found", async () => {
    const without = await scan(WEBSITE, site(html({ body: "<p>Hello</p>" })));
    expect(f(without.report, "trust.contact").state).toBe("missing");
    const withText = await scan(WEBSITE, site(html({ body: "<p>Call us on 0803 123 4567</p>" })));
    expect(f(withText.report, "trust.contact").state).toBe("found");
  });

  it("trust.schema needs a local business, not just a website schema", async () => {
    const weak = await scan(WEBSITE, site(html({ ld: [{ "@type": "WebSite" }] })));
    expect(f(weak.report, "trust.schema").state).toBe("missing");
    const strong = await scan(WEBSITE, site(html({ ld: [{ "@type": "Dentist" }] })));
    expect(f(strong.report, "trust.schema").state).toBe("found");
  });
});

describe("EN-01, EN-02, SC-03: what we could not check never lowers the score", () => {
  it.each([
    ["a timeout", "hang", "timeout"],
    ["a bot block (403)", res("denied", { status: 403 }), "blocked"],
    ["too many requests (429)", res("slow down", { status: 429 }), "blocked"],
    ["a refused connection", netError("ECONNREFUSED"), "connection_failed"],
  ])("%s: every website check is 'could not check', the website score is empty, not zero", async (_name, page, cause) => {
    const { report } = await scan(WEBSITE, site(page as Route));
    const web = report.findings.filter((x) => x.group === "website");
    expect(web.every((x) => x.state === "could_not_check")).toBe(true);
    expect(web.every((x) => x.earned === 0)).toBe(true);
    expect(f(report, "site.reachable").cause).toBe(cause);
    expect(report.score.website).toBeNull();
    expect(report.score.total).toBeNull();
    expect(report.couldNotCheck.length).toBeGreaterThan(0);
    expect(report.findings.some((x) => x.state === "missing" && x.group === "website")).toBe(false);
  });

  it("a page that loads but whose extras cannot be fetched is scored on what could be checked", async () => {
    const { report } = await scan(WEBSITE, site(GOOD_PAGE, { "https://toss.example/robots.txt": "hang", "https://toss.example/sitemap.xml": "hang" }));
    expect(f(report, "find.robots_sitemap").state).toBe("could_not_check");
    expect(report.score.website).toBe(100); // 96 of 96 counted points, not 96 of 100
  });

  it("EN-23: the whole scan respects its time budget and returns what it has", async () => {
    const started = Date.now();
    const { report } = await scan(WEBSITE, site("hang" as unknown as string), { timeoutMs: 5000, budgetMs: 150 });
    expect(Date.now() - started).toBeLessThan(2000);
    expect(f(report, "site.reachable")).toMatchObject({ state: "could_not_check", cause: "timeout" });
  });
});

describe("things that are certain", () => {
  it("a domain that does not exist is a certain, high-priority finding and a website score of 0", async () => {
    const { report } = await scan({ website: "https://nope.example/" }, { "*": netError("ENOTFOUND") });
    expect(f(report, "site.reachable")).toMatchObject({ state: "missing", priority: "HIGH", cause: "domain_not_found", earned: 0 });
    expect(report.score.website).toBe(0);
  });

  it("an expired certificate is certain, high priority, and not hidden behind a fallback", async () => {
    const { report, net } = await scan({ website: "toss.example" }, { "*": netError("CERT_HAS_EXPIRED") });
    expect(f(report, "site.https")).toMatchObject({ state: "missing", priority: "HIGH", cause: "certificate_expired" });
    expect(f(report, "site.reachable").state).toBe("could_not_check");
    expect(net.calls.some((u) => u.startsWith("http://"))).toBe(false);
  });

  it.each([
    ["a server error", res("err", { status: 500 }), "server_error"],
    ["a PDF", res("%PDF", { type: "application/pdf" }), "not_html"],
  ])("%s on the home page is reported plainly", async (_n, page, cause) => {
    const { report } = await scan(WEBSITE, site(page));
    expect(f(report, "site.reachable")).toMatchObject({ state: "missing", priority: "HIGH", cause });
  });

  it("a 404 on the home page is not a certain claim: some real sites (flutterwave.com) answer 404 to automatic visitors only", async () => {
    const { report } = await scan(WEBSITE, site(res("nf", { status: 404 })));
    expect(f(report, "site.reachable")).toMatchObject({ state: "could_not_check", cause: "not_found" });
    expect(report.score.website).toBeNull();
  });

  it("a parked domain is 'no real website yet', not a scored website", async () => {
    const { report } = await scan(WEBSITE, site("<html><body><h1>This domain is for sale</h1>Buy this domain today</body></html>"));
    expect(f(report, "site.reachable")).toMatchObject({ state: "missing", cause: "parked" });
    expect(f(report, "page.title").state).toBe("could_not_check");
  });

  it("a maintenance page is 'could not check', because it is temporary", async () => {
    const { report } = await scan(WEBSITE, site("<html><body><h1>We'll be back soon</h1><p>Under maintenance.</p></body></html>"));
    expect(f(report, "site.reachable").state).toBe("could_not_check");
    expect(report.score.website).toBeNull();
  });

  it("a bot-check page is 'could not check' even when it answers 200", async () => {
    const { report } = await scan(WEBSITE, site("<html><head><title>Just a moment...</title></head><body>Checking your browser before accessing toss.example</body></html>"));
    expect(f(report, "site.reachable")).toMatchObject({ state: "could_not_check", cause: "blocked" });
  });
});

describe("EN-03, EN-14: https, redirects and certificates", () => {
  it("a site that is only on http is told so", async () => {
    const { report } = await scan({ website: "toss.example" }, { "https://toss.example/": netError("ECONNREFUSED"), "http://toss.example/": res(GOOD_PAGE), "*": res("", { status: 404 }) });
    expect(f(report, "site.https")).toMatchObject({ state: "missing", priority: "HIGH" });
    expect(f(report, "site.reachable").state).toBe("found");
  });

  it("a certificate that expires within 30 days adds a warning that costs no points", async () => {
    const soon = await scan(WEBSITE, site(GOOD_PAGE), { certDaysLeft: async () => 10 });
    expect(f(soon.report, "site.cert_expiring")).toMatchObject({ state: "missing", points: 0, priority: "MEDIUM" });
    expect(soon.report.score.website).toBe(100);
    const fine = await scan(WEBSITE, site(GOOD_PAGE), { certDaysLeft: async () => 90 });
    expect(fine.report.findings.some((x) => x.id === "site.cert_expiring")).toBe(false);
    const unreadable = await scan(WEBSITE, site(GOOD_PAGE), { certDaysLeft: async () => null });
    expect(unreadable.report.findings.some((x) => x.id === "site.cert_expiring")).toBe(false);
  });

  it("a move to another domain is noted and the final site is the one scanned", async () => {
    const { report } = await scan(
      { website: "https://old.example/" },
      { "https://old.example/": redirect("https://toss.example/"), ...site(GOOD_PAGE) }
    );
    expect(report.site).toMatchObject({ finalUrl: "https://toss.example/", movedToOtherDomain: true });
    expect(report.score.website).toBe(100);
  });
});

describe("EN-13, EN-15: discoverability and speed", () => {
  it("robots.txt or sitemap.xml is enough; pages that answer 200 with a web page do not count", async () => {
    const onlyRobots = await scan(WEBSITE, site(GOOD_PAGE, { "https://toss.example/sitemap.xml": res("nf", { status: 404 }) }));
    expect(f(onlyRobots.report, "find.robots_sitemap").state).toBe("found");
    const soft = await scan(WEBSITE, site(GOOD_PAGE, { "https://toss.example/robots.txt": SOFT_404, "https://toss.example/sitemap.xml": SOFT_404 }));
    expect(f(soft.report, "find.robots_sitemap").state).toBe("missing");
  });

  it.each([
    [500, 6],
    [3900, 6],
    [6000, 3],
    [9000, 0],
  ])("a page that answers in %i ms earns %i of 6 speed points, measured from our server", async (ms, earned) => {
    const clock = { t: 0 };
    const page: Route = () => {
      clock.t += ms;
      return res(GOOD_PAGE);
    };
    const net = fakeNet(site(page));
    const report = await runScan(WEBSITE, { fetch: net.fetch, lookup: fakeLookup().lookup, now: () => clock.t, certDaysLeft: async () => 90, timeoutMs: 80, retryDelayMs: 0 });
    expect(f(report, "speed").earned).toBe(earned);
    expect(f(report, "speed").why).toMatch(/from our (server|side)/i);
  });
});

describe("EN-16: pages built with JavaScript get the benefit of the doubt", () => {
  const spa = `<!doctype html><html lang="en"><head><title>Toss Spa</title><meta name="viewport" content="width=device-width"></head><body><div id="root"></div>${'<script src="/a.js"></script>'.repeat(4)}</body></html>`;

  it("absence findings are flagged so the wording can say they may be added by JavaScript", async () => {
    const { report } = await scan(WEBSITE, site(spa));
    for (const id of ["page.description", "trust.contact", "trust.schema", "page.heading", "social.linked"]) {
      expect(f(report, id).state, id).toBe("missing");
      expect(f(report, id).caveat, id).toBe("js_built");
    }
    expect(f(report, "page.title").state).toBe("found");
  });

  it("an ordinary page's absence findings carry no such caveat", async () => {
    const { report } = await scan(WEBSITE, site(html({ description: null })));
    expect(f(report, "page.description").caveat).toBeUndefined();
  });
});

describe("EN-12: social links and what can be verified", () => {
  const linked = (extra = "") => html({ body: `<a href="https://www.instagram.com/tossspa">i</a>${extra}` });

  it("an Instagram link on the site counts as linked and present, but cannot be verified, and that part is left out", async () => {
    const { report, net } = await scan(WEBSITE, site(linked()));
    expect(f(report, "social.linked").state).toBe("found");
    expect(f(report, "social.present").state).toBe("found");
    expect(f(report, "social.verified").state).toBe("could_not_check");
    expect(report.score.social).toBe(100); // 70 of 70 counted points
    expect(net.calls.some((u) => u.includes("instagram.com"))).toBe(false);
  });

  it("a linked X profile that exists is verified; one that is gone is a broken link", async () => {
    const live = await scan(WEBSITE, site(html({ body: '<a href="https://x.com/tossspa">x</a>' }), { "https://x.com/tossspa": res("ok") }));
    expect(f(live.report, "social.verified").state).toBe("found");
    const gone = await scan(WEBSITE, site(html({ body: '<a href="https://x.com/tossspa">x</a>' }), { "https://x.com/tossspa": res("nf", { status: 404 }) }));
    expect(f(gone.report, "social.verified")).toMatchObject({ state: "missing", priority: "MEDIUM", earned: 0 });
  });

  it("no social links on a loaded page is missing; a handle the owner typed but the site does not link is flagged, not scored as present", async () => {
    const none = await scan(WEBSITE, site(html({ body: "<p>Hi</p>" })));
    expect(f(none.report, "social.linked").state).toBe("missing");
    expect(f(none.report, "social.present").state).toBe("missing");
    const typedOnly = await scan({ ...WEBSITE, handles: { instagram: "tossspa" } }, site(html({ body: "<p>Hi</p>" })));
    expect(f(typedOnly.report, "social.linked").state).toBe("missing");
    expect(f(typedOnly.report, "social.present").state).toBe("could_not_check");
  });

  it("a typed handle alone no longer earns a perfect score (it used to)", async () => {
    const { report } = await scan({ handles: { instagram: "tossspa" } }, {});
    expect(report.score.social).toBeNull();
  });
});

describe("NW-02, NW-03, SC-08: no website yet", () => {
  const input = { name: "Toss Spa", city: "Lagos", category: "Spa & Wellness", handles: { instagram: "tossspa" }, whatsapp: "0803 123 4567" };

  it("uses the no-website path, says so, and makes no request to any website", async () => {
    const { report, net } = await scan(input, {});
    expect(report.path).toBe("no_website");
    expect(net.calls).toEqual([]);
    expect(f(report, "site.none")).toMatchObject({ state: "missing", priority: "HIGH", earned: 0 });
    expect(report.score.website).toBeNull();
  });

  it("the Google listing is 'connect later', never a failure, and left out of the score", async () => {
    const { report } = await scan(input, {});
    expect(f(report, "google.profile").state).toBe("could_not_check");
    expect(report.couldNotCheck).toContain("google.profile");
  });

  it("shows points available instead of a discouraging bare zero", async () => {
    const { report } = await scan(input, {});
    expect(report.score.total).toBeNull();
    expect(report.score.possible).toBe(200);
    expect(report.score.pointsAvailable).toBe(report.score.possible - report.score.earned);
    expect(report.score.pointsAvailable).toBeGreaterThan(0);
  });

  it("leads with a Start here plan: free steps first, each with effort and time, built from what they told us", async () => {
    const { report } = await scan(input, {});
    const plan = report.startHere!;
    expect(plan.length).toBeGreaterThanOrEqual(4);
    expect(plan.length).toBeLessThanOrEqual(6);
    const rank = { free: 0, low: 1, paid: 2 } as const;
    expect(plan.map((s) => rank[s.cost])).toEqual([...plan.map((s) => rank[s.cost])].sort((a, b) => a - b));
    expect(plan[0].cost).toBe("free");
    for (const step of plan) {
      expect(step.title.length).toBeGreaterThan(5);
      expect(step.why.length).toBeGreaterThan(10);
      expect(step.minutes).toBeGreaterThan(0);
    }
    expect(plan.map((s) => s.id)).toEqual(expect.arrayContaining(["google.profile", "website.first"]));
  });

  it("builds a WhatsApp chat link from the number they gave, and ignores a bad one", async () => {
    const good = await scan(input, {});
    expect(good.report.whatsapp).toEqual({ e164: "+2348031234567", link: "https://wa.me/2348031234567" });
    const bad = await scan({ ...input, whatsapp: "123" }, {});
    expect(bad.report.whatsapp).toBeNull();
  });

  it("a verified X account counts for something but the page still does not pretend to be a full score", async () => {
    const { report } = await scan({ name: "Toss", handles: { x: "tossspa" } }, { "https://x.com/tossspa": res("ok") });
    expect(f(report, "social.verified").state).toBe("found");
    expect(report.score.total).toBeNull();
  });

  it("IN-05, UB-12: a social URL typed into the website box is treated as a social profile, not scanned as a website", async () => {
    const { report, net } = await scan({ website: "https://www.instagram.com/tossspa/" }, {});
    expect(report.path).toBe("no_website");
    expect(report.inputNote).toMatchObject({ kind: "social", platform: "instagram", handle: "tossspa" });
    expect(net.calls).toEqual([]);
  });

  it("a Google Maps link or a phone number in the website box is explained, and the scan still runs the no-website path", async () => {
    const maps = await scan({ website: "https://maps.app.goo.gl/xyz" }, {});
    expect(maps.report.path).toBe("no_website");
    expect(maps.report.inputNote?.kind).toBe("google_maps");
    const phone = await scan({ website: "0803 123 4567" }, {});
    expect(phone.report.inputNote?.kind).toBe("phone");
    expect(phone.report.whatsapp?.e164).toBe("+2348031234567");
  });
});

describe("NW-01: with only a name, nothing has been looked at, and the page never says it was", () => {
  it("makes no request, leaves social out of the score and asks for a handle, instead of claiming none was found", async () => {
    const { report, net } = await scan({ name: "Toss Spa", city: "Lagos" }, {});
    expect(net.calls).toEqual([]);
    for (const id of ["social.present", "social.verified"]) {
      const x = f(report, id);
      expect(x.state, id).toBe("could_not_check");
      expect(`${x.title} ${x.why} ${x.fix}`, id).not.toMatch(/we found no|no social media for your business|we found nothing/i);
      expect(`${x.title} ${x.fix}`, id).toMatch(/handle|tell us/i);
    }
    expect(report.score.social).toBeNull();
    expect(report.score.pointsAvailable).toBe(200);
    expect(report.fixes.some((x) => x.group === "social")).toBe(false);
  });

  it("a handle on a platform we can check is looked at: found when it exists", async () => {
    const { report, net } = await scan({ name: "Toss", handles: { x: "tossspa" } }, { "https://x.com/tossspa": res("ok") });
    expect(net.calls).toEqual(["https://x.com/tossspa"]);
    expect(f(report, "social.verified").state).toBe("found");
  });
});

describe("SC-06: the order of fixes", () => {
  it("fixes come highest priority first, then quickest, then most valuable, and the top three are the first three", async () => {
    const { report } = await scan({ website: "toss.example" }, { "https://toss.example/": netError("ECONNREFUSED"), "http://toss.example/": res(html({ title: null, description: null, viewport: false, ld: [], body: "<p>Hi</p>" })), "*": res("", { status: 404 }) });
    const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
    const fixes = report.fixes;
    expect(fixes.length).toBeGreaterThanOrEqual(4);
    for (let i = 1; i < fixes.length; i++) {
      const [p, q] = [fixes[i - 1], fixes[i]];
      expect(rank[p.priority]).toBeLessThanOrEqual(rank[q.priority]);
      if (p.priority === q.priority) {
        expect(p.minutes).toBeLessThanOrEqual(q.minutes);
        if (p.minutes === q.minutes) expect(p.points).toBeGreaterThanOrEqual(q.points);
      }
    }
    expect(report.topFixes).toEqual(fixes.slice(0, 3));
    expect(fixes.every((x) => x.state === "missing")).toBe(true);
  });
});

describe("XP-04, UX-04, SE-15: every finding teaches, speaks plainly and behaves", () => {
  const scenarios: Array<[string, Parameters<typeof runScan>[0], Routes]> = [
    ["perfect", WEBSITE, site(GOOD_PAGE)],
    ["bare", WEBSITE, site(html({ title: null, description: null, viewport: false, h1: null, canonical: null, ogImage: null, favicon: false, body: "<p>Hi</p>" }))],
    ["timeout", WEBSITE, site("hang" as unknown as string)],
    ["blocked", WEBSITE, site(res("no", { status: 403 }))],
    ["dead domain", WEBSITE, { "*": netError("ENOTFOUND") }],
    ["expired certificate", { website: "toss.example" }, { "*": netError("CERT_HAS_EXPIRED") }],
    ["server error", WEBSITE, site(res("e", { status: 500 }))],
    ["no website", { name: "Toss", city: "Lagos", handles: { instagram: "toss" }, whatsapp: "0803 123 4567" }, {}],
  ];
  const BANNED = [/\bdown\b/i, /unreachable/i, /you don'?t have/i, /\bbroken\b(?! link)/i, /\bfail(ed|ure|s)?\b/i, /\bdead\b/i, /\bhacked\b/i, /\bterrible\b/i, /\bawful\b/i];
  const JARGON = /\b(meta|canonical|schema|seo|json-ld|html|dns|ssl|tls|viewport|robots\.txt|sitemap|favicon|og:)\b/i;

  it.each(scenarios)("%s: every finding has what, why, how, and a time; no jargon in titles or reasons; plain words only", async (_n, input, routes) => {
    const { report, net } = await scan(input, routes);
    expect(report.findings.length).toBeGreaterThan(0);
    for (const x of report.findings) {
      expect(x.title.trim().length, x.id).toBeGreaterThan(4);
      expect(x.title.length, x.id).toBeLessThanOrEqual(90);
      expect(x.why.trim().length, x.id).toBeGreaterThan(10);
      expect(x.fix.trim().length, x.id).toBeGreaterThan(5);
      expect(x.fix.length, x.id).toBeLessThanOrEqual(220);
      expect(Number.isInteger(x.minutes) && x.minutes > 0, x.id).toBe(true);
      expect(["HIGH", "MEDIUM", "LOW"]).toContain(x.priority);
      const text = `${x.title} ${x.why} ${x.fix}`;
      expect(text, x.id).not.toMatch(/undefined|null|\[object|NaN|\{\{|%s/);
      for (const re of BANNED) expect(text, `${x.id} matches ${re}`).not.toMatch(re);
      expect(`${x.title} ${x.why}`, `${x.id} uses jargon`).not.toMatch(JARGON);
      expect(readingGrade(`${x.why}.`), `${x.id} is hard to read`).toBeLessThanOrEqual(9);
    }
    for (const req of net.requests) expect(req.headers.get("user-agent")).toMatch(/TossVisibilityBot/);
  });

  it("anything we could not check says so in those words and says it is not counted", async () => {
    const { report } = await scan(WEBSITE, site(res("no", { status: 403 })));
    for (const x of report.findings.filter((y) => y.group === "website")) {
      expect(`${x.why} ${x.title}`, x.id).toMatch(/could not|couldn't|blocked|not (counted|in your score)/i);
    }
  });

  it("uncertain causes never use the certain-sounding words", async () => {
    for (const page of ["hang" as unknown as string, res("no", { status: 403 }), netError("ECONNREFUSED") as unknown as string]) {
      const { report } = await scan(WEBSITE, site(page));
      const text = report.findings.map((x) => `${x.title} ${x.why} ${x.fix}`).join(" ");
      expect(text).not.toMatch(/does not exist|has expired|is missing|you have no/i);
    }
  });

  it("certain causes may say so plainly", async () => {
    const { report } = await scan({ website: "toss.example" }, { "*": netError("CERT_HAS_EXPIRED") });
    expect(`${f(report, "site.https").title} ${f(report, "site.https").why}`).toMatch(/expired/i);
  });
});
