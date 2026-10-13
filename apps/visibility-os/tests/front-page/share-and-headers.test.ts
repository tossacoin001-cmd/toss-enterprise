import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// What the scan of our own site shows that its score does not count: how the site looks when it is
// shared (WhatsApp, X, LinkedIn), how long the description is, and the safety headers. UX-09, SE-08.

const root = new URL("../../", import.meta.url);
const src = (p: string) => readFileSync(new URL(p, root), "utf8");
const { metadata, viewport } = await import("@/app/layout");
const config = (await import("../../next.config")).default;

describe("UX-09: sharing the site gives a proper preview card", () => {
  it("has Open Graph and Twitter card details with a title, description, address and name", () => {
    const og = metadata.openGraph as Record<string, unknown>;
    expect(og).toBeTruthy();
    expect(og.title).toMatch(/Visibility OS/);
    expect(String(og.description).length).toBeGreaterThan(40);
    expect(String(og.siteName)).toMatch(/Visibility OS/);
    expect(String(og.url ?? "")).toMatch(/^https:\/\/tossvisibilityos\.com/);
    const tw = metadata.twitter as Record<string, unknown>;
    expect(tw.card).toBe("summary_large_image");
  });

  it("makes a 1200 by 630 share image from the page itself, so nothing heavy is stored or fetched", () => {
    expect(existsSync(new URL("app/opengraph-image.tsx", root))).toBe(true);
    const img = src("app/opengraph-image.tsx");
    expect(img).toMatch(/size\s*=\s*\{\s*width:\s*1200,\s*height:\s*630\s*\}/);
    expect(img).toMatch(/contentType\s*=\s*["']image\/png["']/);
    expect(img).toMatch(/export const alt\s*=\s*["'][^"']{15,}/);
    expect(img).toMatch(/ImageResponse/);
  });

  it("the share image says what the product is, in plain words, with no invented numbers or customers", () => {
    const img = src("app/opengraph-image.tsx");
    expect(img).toMatch(/Can people find/i);
    expect(img).not.toMatch(/\b\d{2,}\s*(\+|businesses|customers|users|owners)/i);
  });
});

describe("search results show the whole description, not a cut-off one", () => {
  it("the description is 155 characters or fewer", () => {
    expect(String(metadata.description).length).toBeLessThanOrEqual(155);
    expect(String(metadata.description).length).toBeGreaterThan(80);
  });

  it("the title is 60 characters or fewer", () => {
    expect(String(metadata.title).length).toBeLessThanOrEqual(60);
  });

  it("phones colour the browser bar to match the page", () => {
    expect(JSON.stringify(viewport)).toMatch(/themeColor/);
  });
});

describe("SE-08: every page, not just result pages, carries the basic safety headers", () => {
  it("sends nosniff, a referrer policy and a frame rule for all pages", async () => {
    const rules = await config.headers!();
    const all = rules.find((r) => r.source === "/(.*)");
    expect(all, "a rule for every page").toBeDefined();
    const h = Object.fromEntries(all!.headers.map((x) => [x.key.toLowerCase(), x.value]));
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["permissions-policy"]).toMatch(/camera=\(\)/);
  });

  it("result pages keep their stricter rule (no referrer at all, not indexed)", async () => {
    const rules = await config.headers!();
    const scan = rules.find((r) => r.source.startsWith("/scan"));
    const h = Object.fromEntries(scan!.headers.map((x) => [x.key.toLowerCase(), x.value]));
    expect(h["referrer-policy"]).toBe("no-referrer");
    expect(h["x-robots-tag"]).toMatch(/noindex/);
  });
});
