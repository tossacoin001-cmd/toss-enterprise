import { readFileSync, readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Motion has a job (show progress, show the score, welcome the visitor) and a budget: it must never
// make the page heavy, janky on a cheap phone, or unusable for people who turn motion off.

const root = new URL("../../", import.meta.url);
const src = (p: string) => readFileSync(new URL(p, root), "utf8");
const css = src("app/globals.css");

/** The text inside the braces that start at `open` (an index of "{"). */
function block(s: string, open: number): string {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}" && --depth === 0) return s.slice(open + 1, i);
  }
  return s.slice(open + 1);
}

const motionOk = (() => {
  const m = css.match(/@media\s*\(\s*prefers-reduced-motion:\s*no-preference\s*\)\s*\{/);
  return m ? block(css, m.index! + m[0].length - 1) : "";
})();
const outside = motionOk ? css.replace(motionOk, "") : css;

describe("all movement is opt-in: it only runs when the visitor has not asked for less motion", () => {
  it("the page has a no-preference block that holds its animations", () => {
    expect(motionOk.length).toBeGreaterThan(200);
    expect(motionOk).toMatch(/@keyframes/);
  });

  it("no animation or keyframes live outside it (hover transitions are fine)", () => {
    expect(outside).not.toMatch(/\banimation(-name)?\s*:/);
    expect(outside).not.toMatch(/@keyframes/);
  });

  it("scroll-behavior smooth is switched off for people who asked for less motion", () => {
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*scroll-behavior:\s*auto/);
  });
});

describe("motion is cheap and does not shift the page", () => {
  const frames = [...motionOk.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)].map((m) => ({ name: m[1], body: block(motionOk, m.index! + m[0].length - 1) }));

  it("has a handful of named keyframes, not a library", () => {
    expect(frames.length).toBeGreaterThanOrEqual(4);
    expect(frames.length).toBeLessThanOrEqual(10);
  });

  it.each(frames.map((f) => [f.name, f.body]))("%s animates only transform and opacity, so nothing reflows", (_name, body) => {
    const props = [...String(body).matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]);
    for (const p of props) expect(["transform", "opacity"], `${_name} animates ${p}`).toContain(p);
  });

  it("entrance animations are short and the only endless ones are slow and subtle", () => {
    const decls = [...motionOk.matchAll(/animation\s*:\s*([^;}]+)/g)].map((m) => m[1]);
    expect(decls.length).toBeGreaterThanOrEqual(4);
    let endless = 0;
    for (const d of decls) {
      const secs = [...d.matchAll(/(\d*\.?\d+)(ms|s)\b/g)].map((m) => (m[2] === "ms" ? +m[1] / 1000 : +m[1]));
      const dur = secs[0] ?? 0;
      if (/infinite/.test(d)) {
        endless++;
        expect(dur, d).toBeGreaterThanOrEqual(4);
      } else expect(dur, d).toBeLessThanOrEqual(1);
    }
    expect(endless).toBeLessThanOrEqual(2);
  });

  it("uses no will-change hints or filters that make cheap phones struggle", () => {
    expect(motionOk).not.toMatch(/will-change|filter\s*:|backdrop-filter/);
  });
});

describe("no animation library, no video, no heavy files", () => {
  const files = (dir: string): string[] =>
    readdirSync(new URL(dir, root)).flatMap((n) => {
      const rel = `${dir}${n}`;
      return statSync(new URL(rel, root)).isDirectory() ? files(`${rel}/`) : [rel];
    });
  const front = ["app/page.tsx", ...["components/scan/", "components/home/", "components/art/", "lib/scan-ui/"].flatMap((d) => { try { return files(d); } catch { return []; } })].filter((f) => /\.tsx?$/.test(f));

  it("the front page code never imports framer-motion, lottie, gsap or similar", () => {
    expect(front.length).toBeGreaterThan(5);
    for (const f of front) expect(src(f), f).not.toMatch(/from ["'](framer-motion|motion|motion\/react|lottie[\w-]*|@lottiefiles[\w/-]*|gsap|animejs|react-spring|@react-spring[\w/-]*)["']/);
  });

  it("no autoplay video or large animated image on the front page", () => {
    for (const f of front) expect(src(f), f).not.toMatch(/<video\b|\.gif\b|\.mp4\b|\.webm\b|\.lottie\b|lottie-player/i);
  });

  it("the art is inline and small: the whole drawings file stays under 20 KB", () => {
    expect(src("components/art/People.tsx").length).toBeLessThan(20_000);
    expect(src("components/art/Icons.tsx").length).toBeLessThan(10_000);
  });
});
