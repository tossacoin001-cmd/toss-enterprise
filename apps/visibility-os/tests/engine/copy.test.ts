import { describe, expect, it } from "vitest";
import { FINDING_IDS, allCustomerCopy } from "@/lib/scan/copy";
import { readingGrade } from "./helpers";

// UX-04, XP-03, XP-04, BG-07. Every sentence an owner could ever be shown is
// audited here, not only the ones a particular scan happens to produce.

const copy = allCustomerCopy();

const BANNED = [/\bdown\b/i, /unreachable/i, /you don'?t have/i, /\bfail(ed|ure|s)?\b/i, /\bdead\b/i, /\bhacked\b/i, /\bterrible\b/i, /\bawful\b/i, /!{2,}/, /\bsimply\b/i, /\bobviously\b/i, /\bjust\b(?= (fix|add|do))/i];
const JARGON = /\b(meta|canonical|schema|seo|json-ld|html|dns|ssl|tls|viewport|robots\.txt|sitemap|favicon|og:|http|api|ssrf|regex)\b/i;
const CERTAIN_ONLY = /does not exist|has expired|is not trusted|are not trusted|no website/i;

describe("coverage", () => {
  it("has copy for every finding the engine can produce", () => {
    expect(FINDING_IDS).toEqual(
      expect.arrayContaining([
        "site.reachable", "site.https", "site.cert_expiring", "site.none", "page.title", "page.description", "page.mobile", "page.heading", "page.canonical",
        "trust.contact", "trust.schema", "find.robots_sitemap", "speed", "social.present", "social.linked", "social.verified", "google.profile",
      ])
    );
    for (const id of FINDING_IDS) {
      const fields = new Set<string>(copy.filter((c) => c.id === id).map((c) => c.field));
      for (const need of ["title", "why", "fix"]) expect(fields.has(need), `${id} lacks ${need}`).toBe(true);
    }
  });

  it("covers every way a visit can go wrong, each with its own wording", () => {
    const causes = new Set<string | undefined>(copy.filter((c) => c.id === "site.reachable" && c.cause).map((c) => c.cause));
    for (const cause of ["domain_not_found", "timeout", "connection_failed", "blocked", "not_found", "server_error", "not_html", "too_many_redirects", "unsafe_address", "invalid_url", "parked"]) {
      expect(causes.has(cause), `no wording for ${cause}`).toBe(true);
    }
    const https = new Set<string | undefined>(copy.filter((c) => c.id === "site.https" && c.cause).map((c) => c.cause));
    for (const cause of ["certificate_expired", "certificate_untrusted", "certificate_wrong_name"]) expect(https.has(cause), `no https wording for ${cause}`).toBe(true);
  });

  it("each finding has wording for found, missing and could-not-check", () => {
    for (const id of FINDING_IDS.filter((i) => !["site.cert_expiring", "site.none"].includes(i))) {
      const states = new Set(copy.filter((c) => c.id === id).map((c) => c.state));
      expect(states.has("found") && states.has("missing") && states.has("could_not_check"), `${id}: ${[...states].join(",")}`).toBe(true);
    }
  });

  it("the JavaScript caveat exists for the things pages often add with JavaScript", () => {
    for (const id of ["page.description", "page.heading", "trust.contact", "trust.schema", "social.linked"]) {
      const caveat = copy.find((c) => c.id === id && c.state === "missing" && c.caveat === "js_built" && c.field === "why");
      expect(caveat, id).toBeTruthy();
      expect(caveat!.text).toMatch(/JavaScript/);
    }
  });
});

describe("every sentence", () => {
  it("is clean text: no leftovers, no stray spaces, ends properly", () => {
    for (const c of copy) {
      expect(c.text, `${c.id}/${c.field}`).not.toMatch(/undefined|null|\[object|NaN|\{|\}|%s|\$\{/);
      expect(c.text).toBe(c.text.trim());
      expect(c.text).not.toMatch(/\s{2,}/);
      if (c.field === "why" || c.field === "fix") expect(c.text, `${c.id}/${c.field} should end with a full stop`).toMatch(/[.?]$/);
    }
  });

  it("avoids the banned phrases", () => {
    for (const c of copy) for (const re of BANNED) expect(c.text, `${c.id}/${c.field} matches ${re}`).not.toMatch(re);
  });

  it("keeps jargon out of titles and reasons (the technical name lives in its own field)", () => {
    for (const c of copy.filter((x) => x.field === "title" || x.field === "why")) expect(c.text, `${c.id}/${c.field}: ${c.text}`).not.toMatch(JARGON);
  });

  it("reads at grade 9 or below, and titles are short", () => {
    for (const c of copy.filter((x) => x.field === "why" || x.field === "fix")) {
      expect(readingGrade(c.text), `${c.id}/${c.field}: ${c.text}`).toBeLessThanOrEqual(9);
    }
    for (const c of copy.filter((x) => x.field === "title")) expect(c.text.length, c.text).toBeLessThanOrEqual(90);
  });

  it("states a fix that is one or two sentences", () => {
    for (const c of copy.filter((x) => x.field === "fix")) {
      const sentences = (c.text.match(/[.?!](\s|$)/g) || []).length;
      expect(sentences, `${c.id}: ${c.text}`).toBeLessThanOrEqual(2);
    }
  });
});

describe("certainty is earned", () => {
  it("only certain causes may use certain-sounding words", () => {
    for (const c of copy) {
      if (c.certain) continue;
      expect(c.text, `${c.id}/${c.field}/${c.cause ?? c.state}: ${c.text}`).not.toMatch(CERTAIN_ONLY);
    }
  });

  it("could-not-check wording says it is not counted against the owner", () => {
    for (const c of copy.filter((x) => x.state === "could_not_check" && x.field === "why")) {
      expect(c.text, `${c.id}: ${c.text}`).toMatch(/not (counted|in your score|held against)|left out|does not (count|affect)/i);
    }
  });

  it("could-not-check wording explains who could not do what", () => {
    for (const c of copy.filter((x) => x.state === "could_not_check" && x.field === "why")) {
      expect(c.text, `${c.id}: ${c.text}`).toMatch(/could not|couldn't|blocked|not able|cannot/i);
    }
  });
});

describe("tone (BG-07)", () => {
  it("is warm and specific: no shouting, no blame, no hype", () => {
    for (const c of copy) {
      expect(c.text, `${c.id}/${c.field}`).not.toMatch(/\b[A-Z]{5,}\b/);
      expect(c.text).not.toMatch(/\b(your fault|you failed|you should have|obviously|everyone knows|guaranteed|100% sure|best in)\b/i);
    }
  });

  it("speaks to the owner directly in most reasons", () => {
    const why = copy.filter((c) => c.field === "why" && c.state !== "found");
    const direct = why.filter((c) => /\b(you|your|customers|visitors)\b/i.test(c.text)).length;
    expect(direct / why.length).toBeGreaterThan(0.8);
  });
});
