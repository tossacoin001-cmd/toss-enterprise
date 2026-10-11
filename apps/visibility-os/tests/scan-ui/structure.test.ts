import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Structure guards for the scan pages. Like tests/page-structure.test.ts, these read the source
// because the rules are about what is wired where, and a slip is silent for visitors.

const root = new URL("../../", import.meta.url);
const src = (p: string) => readFileSync(new URL(p, root), "utf8");
const has = (p: string) => existsSync(new URL(p, root));
const walk = (dir: string): string[] =>
  readdirSync(new URL(dir, root)).flatMap((n) => {
    const rel = `${dir}${n}`;
    return statSync(new URL(rel, root)).isDirectory() ? walk(`${rel}/`) : [rel];
  });
const scanFiles = () => ["app/scan/", "components/scan/", "lib/scan-ui/"].filter((d) => has(d)).flatMap(walk).filter((f) => /\.tsx?$/.test(f));

describe("the pages exist", () => {
  it.each(["app/scan/[id]/page.tsx", "components/scan/ScanBox.tsx", "components/scan/ResultView.tsx", "components/scan/SignUpOffer.tsx", "app/privacy/page.tsx", "app/terms/page.tsx", "app/robots.ts"])(
    "%s",
    (f) => expect(has(f), f).toBe(true)
  );
});

describe("UX-01, UX-13: no sign-up wall before the first result", () => {
  it("the scan box and the result page never import Clerk or redirect to sign-up", () => {
    for (const f of ["components/scan/ScanBox.tsx", "app/scan/[id]/page.tsx", "components/scan/ResultView.tsx"]) {
      const s = src(f);
      expect(s, f).not.toMatch(/@clerk/);
      expect(s, f).not.toMatch(/redirect\([^)]*sign-?up/i);
    }
  });

  it("the sign-up link lives only in the offer component, which the result view shows after the result", () => {
    const offer = src("components/scan/SignUpOffer.tsx");
    expect(offer).toMatch(/\/sign-up/);
    const result = src("components/scan/ResultView.tsx");
    expect(result).toMatch(/SignUpOffer/);
    expect(result.indexOf("fixes")).toBeLessThan(result.indexOf("SignUpOffer"));
    expect(src("components/scan/ScanBox.tsx")).not.toMatch(/\/sign-up/);
  });
});

describe("PV-03, SE-08, SE-16: result pages are private, not indexed and safe to open", () => {
  it("the result page is noindex and sends no referrer", () => {
    const page = src("app/scan/[id]/page.tsx");
    expect(page).toMatch(/index:\s*false/);
    expect(page).toMatch(/follow:\s*false/);
    expect(page).toMatch(/referrer:\s*["']no-referrer["']/);
  });

  it("robots.txt keeps crawlers out of /scan and there is no sitemap entry for it", () => {
    expect(src("app/robots.ts")).toMatch(/\/scan/);
    if (has("app/sitemap.ts")) expect(src("app/sitemap.ts")).not.toMatch(/\/scan/);
  });

  it("next.config sends frame, content-type and referrer headers for scan pages", async () => {
    const mod = (await import("../../next.config")).default;
    expect(typeof mod.headers).toBe("function");
    const rules = await mod.headers!();
    const forScan = rules.filter((r) => r.source.startsWith("/scan") || r.source === "/(.*)" || r.source.startsWith("/:path"));
    const names = forScan.flatMap((r) => r.headers.map((h) => h.key.toLowerCase()));
    for (const need of ["x-frame-options", "x-content-type-options", "referrer-policy", "x-robots-tag"]) expect(names, need).toContain(need);
    const csp = forScan.flatMap((r) => r.headers).find((h) => h.key.toLowerCase() === "content-security-policy");
    expect(csp?.value).toMatch(/frame-ancestors 'none'/);
  });

  it("no scan code redirects to an address the visitor supplied", () => {
    for (const f of scanFiles()) expect(src(f), f).not.toMatch(/redirect\(\s*(searchParams|params|req|body|input)/);
  });
});

describe("SE-07: what a visitor types is shown as text, never as markup", () => {
  it("nothing in the scan pages or helpers uses dangerouslySetInnerHTML, innerHTML or eval", () => {
    const files = scanFiles();
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) expect(src(f), f).not.toMatch(/dangerouslySetInnerHTML|\.innerHTML|\beval\(|new Function\(/);
  });
});

describe("PV-04, PV-06: privacy comes before the button", () => {
  it("the scan box links the privacy notice and the terms before its submit button", () => {
    const box = src("components/scan/ScanBox.tsx");
    const privacy = box.indexOf("/privacy");
    const terms = box.indexOf("/terms");
    const button = box.search(/type=["']submit["']/);
    expect(privacy).toBeGreaterThan(-1);
    expect(terms).toBeGreaterThan(-1);
    expect(button).toBeGreaterThan(-1);
    expect(Math.max(privacy, terms)).toBeLessThan(button);
  });

  it("the privacy page says what is checked, what is kept, for how long, that no address is stored, and that the limit cookie is essential", () => {
    const p = src("app/privacy/page.tsx");
    for (const re of [/public/i, /30 days/i, /IP address|network address/i, /cookie/i, /essential/i, /delete/i]) expect(p).toMatch(re);
  });
});

describe("UX-05, UX-08, QL-08: usable on a phone and by keyboard", () => {
  it("the scan box has labelled inputs, 44px tap targets and visible focus", () => {
    const box = src("components/scan/ScanBox.tsx");
    expect(box).toMatch(/<label/);
    expect(box).toMatch(/min-h-11|h-11|h-12|h-14|min-h-12/);
    expect(box).toMatch(/focus-visible:|focus:/);
    expect(box).toMatch(/aria-live|role=["']status["']|role=["']alert["']/);
    expect(box).toMatch(/disabled/); // a loading state exists
  });

  it("the result view has one h1 and headings in order for screen readers", () => {
    const r = src("components/scan/ResultView.tsx");
    expect((r.match(/<h1\b/g) ?? []).length).toBe(1);
    expect(r).toMatch(/<h2\b/);
  });
});

describe("UX-07, QL-05: a finished result is server-rendered, and the page stays light", () => {
  it("the result page is a server component that reads the saved scan directly", () => {
    const page = src("app/scan/[id]/page.tsx");
    expect(page.trimStart()).not.toMatch(/^["']use client["']/);
    expect(page).toMatch(/getScan|prismaStore/);
  });

  it("only the polling part is a client component, and it stops when the scan ends", () => {
    const files = scanFiles().filter((f) => f.startsWith("components/scan/"));
    const client = files.filter((f) => src(f).trimStart().startsWith('"use client"') || src(f).trimStart().startsWith("'use client'"));
    expect(client.map((f) => f.split("/").pop())).toEqual(expect.arrayContaining(["ScanBox.tsx"]));
    const poller = files.find((f) => /Poll|Progress/.test(f));
    expect(poller, "a polling component").toBeDefined();
    expect(src(poller!)).toMatch(/pollDecision/);
  });

  it("the Turnstile script is loaded by the scan box only, and not in the root layout", () => {
    expect(src("app/layout.tsx")).not.toMatch(/turnstile/i);
    expect(src("components/scan/ScanBox.tsx")).toMatch(/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js/);
  });

  it("no scan file pulls in a heavy library", () => {
    for (const f of scanFiles()) expect(src(f), f).not.toMatch(/from ["'](framer-motion|motion|lodash|moment|date-fns|chart\.js|recharts)/);
  });
});

describe("XP-02: the first screen of the home page offers the scan and shows a real example", () => {
  it("the home page shows the scan box and an example result", () => {
    const home = src("app/page.tsx");
    expect(home).toMatch(/ScanBox/);
    expect(home).toMatch(/ExampleResult|SampleResult/);
  });
});
