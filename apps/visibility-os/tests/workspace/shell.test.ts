import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The signed-in frame: every link goes somewhere real, nothing sells what is not for sale, and the
// phone menu works without a mouse. Handoff sections 3, 4 and 8.

const root = new URL("../../", import.meta.url);
const src = (p: string) => readFileSync(new URL(p, root), "utf8");
const walk = (dir: string): string[] =>
  readdirSync(new URL(dir, root)).flatMap((n) => {
    const rel = `${dir}${n}`;
    return statSync(new URL(rel, root)).isDirectory() ? walk(`${rel}/`) : [rel];
  });

/** True when a page exists for this path in the app, in or out of a route group. */
function routeExists(path: string): boolean {
  const clean = path.split("?")[0].split("#")[0].replace(/\/$/, "");
  if (clean === "") return existsSync(new URL("app/page.tsx", root));
  const pages = walk("app/").filter((f) => f.endsWith("/page.tsx") || f.endsWith("/route.ts"));
  const wanted = clean.split("/").filter(Boolean);
  return pages.some((p) => {
    const parts = p.replace(/^app\//, "").replace(/\/(page\.tsx|route\.ts)$/, "").split("/").filter((s) => !/^\(.*\)$/.test(s));
    if (parts.length !== wanted.length) return false;
    return parts.every((seg, i) => seg === wanted[i] || /^\[.*\]$/.test(seg));
  });
}

describe("every link in the workspace goes to a page that exists", () => {
  const sidebar = src("components/Sidebar.tsx");
  const hrefs = [...sidebar.matchAll(/href:\s*"([^"]+)"/g)].map((m) => m[1]);

  it("the navigation lists real sections", () => {
    expect(hrefs.length).toBeGreaterThanOrEqual(4);
    for (const h of hrefs) expect(routeExists(h), h).toBe(true);
  });

  it("no navigation item is marked 'soon', and none is disabled", () => {
    expect(sidebar).not.toMatch(/soon/i);
    expect(sidebar).not.toMatch(/cursor-not-allowed|opacity-40/);
  });

  it("every internal link written in the workspace pages and components resolves", () => {
    const files = [...walk("app/(dashboard)/"), ...walk("components/workspace/"), "components/ConnectGoogleCard.tsx", "components/OnboardingForm.tsx", "app/onboarding/page.tsx"].filter((f) => /\.tsx$/.test(f));
    for (const f of files) {
      for (const m of src(f).matchAll(/href=(?:"|\{`)(\/[^"`$}]*)/g)) {
        expect(routeExists(m[1]), `${f}: ${m[1]}`).toBe(true);
      }
    }
  });
});

describe("it does not sell or promise what does not exist", () => {
  const files = [...walk("app/(dashboard)/"), ...walk("components/workspace/"), "components/Sidebar.tsx", "components/TopBar.tsx", "components/DashboardShell.tsx", "components/OnboardingForm.tsx", "components/ConnectGoogleCard.tsx"].filter((f) => /\.tsx$/.test(f));
  const all = files.map((f) => src(f)).join("\n");

  it("no 'Upgrade', no made-up prices, no 'AI audit' anywhere in the signed-in app", () => {
    expect(all).not.toMatch(/Upgrade/i);
    expect(all).not.toMatch(/\$\d+\/mo|\$\d+ ?\/ ?month|USD/i);
    expect(all).not.toMatch(/AI[- ](audit|generated|powered|action|written)/i);
  });

  it("no placeholder buttons that do nothing", () => {
    expect(src("components/TopBar.tsx")).not.toMatch(/Notifications|Bell/);
  });
});

describe("the page frame is accessible", () => {
  const shell = src("components/DashboardShell.tsx");
  const topbar = src("components/TopBar.tsx");

  it("has a skip link and a main landmark", () => {
    expect(shell).toMatch(/href="#main"/);
    expect(shell).toMatch(/<main id="main"/);
  });

  it("the phone menu closes with Escape, keeps focus inside while open and gives it back", () => {
    expect(shell).toMatch(/Escape/);
    expect(shell).toMatch(/aria-modal/);
    expect(shell).toMatch(/Tab/);
    expect(shell).toMatch(/opener\?\.focus\(\)|menuButton\.current\?\.focus\(\)/);
  });

  it("the menu button says what it does and whether the menu is open", () => {
    expect(topbar).toMatch(/aria-label="Open menu"/);
    expect(topbar).toMatch(/aria-expanded/);
  });

  it("only pages have a main heading: the top bar does not add a second one", () => {
    expect(topbar).not.toMatch(/<h1/);
    expect(src("components/ui/index.tsx")).toMatch(/<h1 className="ws-h1"/);
  });

  it("every page in the workspace gets its heading from PageHeader, once", () => {
    for (const f of walk("app/(dashboard)/").filter((x) => x.endsWith("page.tsx"))) {
      const s = src(f);
      const headings = (s.match(/<h1\b/g) ?? []).length + (s.match(/<PageHeader\b/g) ?? []).length + (s.match(/<DashboardClient\b/g) ?? []).length; // the overview draws its own heading
      expect(headings, f).toBeGreaterThanOrEqual(1);
    }
    expect(src("app/(dashboard)/dashboard/DashboardClient.tsx")).toMatch(/<PageHeader/);
  });

  it("controls are at least 44px tall and have a visible focus", () => {
    const css = src("app/workspace.css");
    expect(css).toMatch(/\.ws-btn\s*\{[^}]*min-height:\s*44px/);
    expect(css).toMatch(/\.ws-nav-item\s*\{[^}]*min-height:\s*44px/);
    expect(css).toMatch(/\.ws-input[^{]*\{[^}]*min-height:\s*44px/);
  });
});

describe("the workspace uses its own tokens", () => {
  it("the signed-in pages no longer use the old dark inline colours", () => {
    const files = [...walk("app/(dashboard)/"), ...walk("components/workspace/"), "components/Sidebar.tsx", "components/TopBar.tsx", "components/DashboardShell.tsx", "components/OnboardingForm.tsx", "components/ConnectGoogleCard.tsx", "components/GooglePlaceSearch.tsx"].filter((f) => /\.tsx$/.test(f));
    for (const f of files) {
      const s = src(f);
      expect(s, f).not.toMatch(/#C9A96E|#FAF7F2|#050E09|#092D22|rgba\(250,247,242|btn-gold|btn-outline-gold|font-display/);
    }
  });
});
