import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The workspace palette must be readable in daylight. These are the checked pairs: WCAG AA is 4.5:1
// for normal text and 3:1 for large text and interface components. Handoff sections 3 and 8.

const css = readFileSync(new URL("../../app/workspace.css", import.meta.url), "utf8");
const token = (name: string): string => {
  const m = css.match(new RegExp(`--ws-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`no token --ws-${name}`);
  return m[1];
};

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("text is readable on every surface it appears on (4.5:1)", () => {
  it.each([
    ["ink", "bg"], ["ink", "surface"], ["ink", "surface-2"],
    ["muted", "bg"], ["muted", "surface"], ["muted", "surface-2"],
    ["nav-ink", "nav"], ["nav-muted", "nav"],
    ["accent-ink", "accent"],
    ["accent", "surface"], ["accent", "bg"], ["accent", "good-soft"],
    ["good", "good-soft"], ["warn", "warn-soft"], ["danger", "danger-soft"], ["info", "info-soft"], ["gold", "gold-soft"],
    ["danger", "surface"],
  ])("%s on %s", (fg, bg) => {
    expect(ratio(token(fg), token(bg)), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
  });
});

describe("interface edges and focus are visible (3:1)", () => {
  it.each([["line-strong", "surface"], ["focus", "surface"], ["focus", "bg"]])("%s against %s", (fg, bg) => {
    expect(ratio(token(fg), token(bg))).toBeGreaterThanOrEqual(3);
  });
});

describe("the workspace is built from tokens, not scattered colours", () => {
  it("defines every colour as a custom property once, on the workspace root", () => {
    expect(css).toMatch(/\.ws-root\s*\{/);
    const outside = css.slice(css.indexOf("}") + 1);
    // after the token block, rules use var(--ws-*) and no literal hex colours
    const rules = outside.replace(/\/\*[\s\S]*?\*\//g, "");
    const literals = rules.match(/#[0-9a-fA-F]{3,6}\b/g) ?? [];
    const allowed = new Set(["#0f4333", "#fff", "#ffe9a8", "#d9bf7f", "#bcdcc8", "#e6d18a", "#eab5ab", "#b9d1ec"]);
    expect(literals.filter((c) => !allowed.has(c.toLowerCase()))).toEqual([]);
  });

  it("scopes itself so the public pages are untouched", () => {
    expect(css).not.toMatch(/^\s*(body|html)\s*\{/m);
    expect(css).not.toMatch(/^\s*\*\s*\{/m);
  });

  it("has a visible keyboard focus and respects reduced motion", () => {
    expect(css).toMatch(/:focus-visible\s*\{[^}]*outline:\s*3px/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\)/);
  });

  it("prints a report without the navigation", () => {
    expect(css).toMatch(/@media print[\s\S]*\.ws-sidebar/);
  });
});
