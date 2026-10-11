import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { readingGrade } from "../engine/helpers";

// The front page for the three audiences: a business with a website, a business that lives on
// Instagram or WhatsApp, and a person whose name is the brand. Rendered to HTML and read like a
// visitor would, so wording, structure and honesty are checked on what is actually on the page.

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => undefined, refresh: () => undefined }) }));

const { default: Home } = await import("@/app/page");
const { default: ScanBox } = await import("@/components/scan/ScanBox");

const html = renderToStaticMarkup(createElement(Home));
const text = (h: string) => h.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/\s+/g, " ").trim();
const box = (audience: "business" | "social" | "personal") => renderToStaticMarkup(createElement(ScanBox, { initialAudience: audience }));

describe("the page speaks to all three audiences, not just 'your business'", () => {
  const t = text(html);
  it("names a business with a website, a business on Instagram or WhatsApp, and a person building a name", () => {
    expect(t).toMatch(/website/i);
    expect(t).toMatch(/Instagram/i);
    expect(t).toMatch(/WhatsApp/i);
    expect(t).toMatch(/creator|freelancer|your own name|just me/i);
  });

  it("offers three clear ways in, with the business one chosen to begin with", () => {
    for (const a of ["business", "social", "personal"]) expect(html, a).toContain(`data-audience="${a}"`);
    expect(html).toMatch(/role="radiogroup"/);
    const checked = [...html.matchAll(/data-audience="(\w+)"[^>]*aria-checked="(true|false)"|aria-checked="(true|false)"[^>]*data-audience="(\w+)"/g)];
    const on = checked.filter((m) => (m[2] ?? m[3]) === "true").map((m) => m[1] ?? m[4]);
    expect(on).toEqual(["business"]);
  });

  it("has one main heading, and the scan box is still the one obvious action", () => {
    expect((html.match(/<h1\b/g) ?? []).length).toBe(1);
    expect(html).toContain('id="scan-website"');
    expect((html.match(/type="submit"/g) ?? []).length).toBe(1);
  });
});

describe("it no longer looks or sounds like the old build", () => {
  const t = text(html);
  it.each([
    [/audits your Google presence/i, "claims a Google check the scan does not do"],
    [/Two minutes to connect/i, "old sign-up-first promise"],
    [/ambitious local businesses/i, "speaks only to local business owners"],
    [/Handle customers can find/i, "old checklist wording"],
    [/lorem|placeholder|TODO/i, "unfinished text"],
  ])("does not say %s (%s)", (re) => expect(t).not.toMatch(re));

  it("is honest that Google is not checked yet and that Instagram cannot be looked inside", () => {
    expect(t).toMatch(/Google[^.]{0,80}(soon|after you sign up)/i);
    expect(t).toMatch(/Instagram[^.]{0,120}(your word|on trust|cannot|can't)/i);
  });

  it("says what it is: free, no sign-up, no card, public information only, kept for 30 days", () => {
    expect(t).toMatch(/free/i);
    expect(t).toMatch(/no sign-?up/i);
    expect(t).toMatch(/no card/i);
    expect(t).toMatch(/public/i);
    expect(t).toMatch(/30 days/i);
  });
});

describe("it feels personal without pretending", () => {
  it("shows three drawn people, one for each audience, each with a plain description for screen readers", () => {
    const people = [...html.matchAll(/<svg[^>]*data-art="person"[^>]*>/g)].map((m) => m[0]);
    expect(people.length).toBeGreaterThanOrEqual(3);
    for (const p of people) expect(p).toMatch(/role="img"[^>]*aria-label="[^"]{10,}"|aria-label="[^"]{10,}"[^>]*role="img"/);
    const kinds = new Set(people.map((p) => p.match(/data-person="(\w+)"/)?.[1]));
    expect(kinds).toEqual(new Set(["business", "social", "personal"]));
  });

  it("uses small inline drawings, never photos, stock images or other people's pictures", () => {
    expect(html).not.toMatch(/<img\b/i);
    expect(html).not.toMatch(/(unsplash|pexels|shutterstock|istock|gettyimages|freepik)/i);
    expect(html).not.toMatch(/url\(["']?https?:/i);
  });

  it("has no made-up testimonials, customer counts or logos of companies we have not worked with", () => {
    const t = text(html);
    expect(t).not.toMatch(/“|”|\btestimonial\b|trusted by|loved by|\b\d{2,}[,\d]*\+? (businesses|owners|customers|users)\b/i);
  });

  it("uses icons that are decoration, hidden from screen readers, and light", () => {
    const icons = [...html.matchAll(/<svg[^>]*data-icon="[\w-]+"[^>]*>/g)].map((m) => m[0]);
    expect(icons.length).toBeGreaterThanOrEqual(6);
    for (const i of icons) expect(i).toMatch(/aria-hidden="true"/);
    const weight = (html.match(/<svg[\s\S]*?<\/svg>/g) ?? []).join("").length;
    expect(weight).toBeLessThan(30_000);
  });
});

describe("it stays light and readable", () => {
  it("the page HTML stays small, with no extra script or font beyond what the box needs", () => {
    expect(html.length).toBeLessThan(75_000);
    expect(html).not.toMatch(/<script[^>]+src=/);
  });

  it("every paragraph reads at grade 9 or below", () => {
    for (const p of [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((m) => text(m[1])).filter((s) => s.split(" ").length >= 6)) {
      expect(readingGrade(/[.!?]$/.test(p) ? p : `${p}.`), p).toBeLessThanOrEqual(9);
    }
  });

  it("every link and button has a name a screen reader can say", () => {
    for (const m of html.matchAll(/<(a|button)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
      const label = text(m[2]) || m[0].match(/aria-label="([^"]+)"/)?.[1] || "";
      expect(label.length, m[0].slice(0, 120)).toBeGreaterThan(1);
    }
  });
});

describe("each audience gets its own form, in its own words", () => {
  it("business: one box for the website address", () => {
    const b = box("business");
    expect(b).toContain('id="scan-website"');
    expect(b).not.toContain('id="scan-name"');
    expect(b).toMatch(/Your website address/);
  });

  it("business on Instagram or WhatsApp: name, area, what you do, Instagram first, WhatsApp; no website box", () => {
    const b = box("social");
    expect(b).not.toContain('id="scan-website"');
    expect(b).toMatch(/Business name/);
    expect(b).toMatch(/Instagram handle/);
    expect(b.indexOf('id="scan-instagram"')).toBeLessThan(b.indexOf('id="scan-whatsapp"'));
    expect(b).toMatch(/I have a website/);
    expect(b).not.toMatch(/Your name\b/);
  });

  it("a person: 'your name', what you do, Instagram, X and LinkedIn handles; no business words", () => {
    const b = box("personal");
    expect(b).toMatch(/Your name/);
    expect(b).toMatch(/creator|freelancer|what you do/i);
    for (const id of ["scan-instagram", "scan-x", "scan-linkedin"]) expect(b, id).toContain(`id="${id}"`);
    expect(b).not.toMatch(/Business name|Business or brand name|customers walk/i);
    expect(b).not.toContain('id="scan-website"');
  });

  it.each(["business", "social", "personal"] as const)("%s: privacy and terms come before the button, and the button is big enough to tap", (a) => {
    const b = box(a);
    const button = b.search(/type="submit"/);
    expect(b.indexOf("/privacy")).toBeGreaterThan(-1);
    expect(b.indexOf("/privacy")).toBeLessThan(button);
    expect(b.indexOf("/terms")).toBeLessThan(button);
    expect(b).toMatch(/min-h-1[12]/);
  });
});
