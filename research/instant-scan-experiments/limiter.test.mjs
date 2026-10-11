// Prototype + test of the instant-scan abuse rules (throwaway; the real version
// will use database rows, but the decision logic is what must be right).
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { domainToASCII } from "node:url";

const DAY = 24 * 3600 * 1000;
export const RULES = { perVisitorPerDay: 3, domainCacheMs: DAY, globalPerDay: 300 };

/** One canonical key per website, so www/case/path/port/trailing-dot tricks can't dodge the cache. */
export function siteKey(input) {
  const raw = String(input).trim();
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  const u = new URL(withScheme);
  if (!/^https?:$/.test(u.protocol)) throw new Error("bad scheme");
  let host = domainToASCII(u.hostname.toLowerCase().replace(/\.$/, ""));
  if (!host || !host.includes(".")) throw new Error("bad host");
  return host.replace(/^www\./, "");
}

export function visitorHash(ip, salt, day) {
  // Daily-rotating salt: a stored hash can't be tied to a person across days.
  return createHash("sha256").update(`${salt}:${day}:${ip}`).digest("hex").slice(0, 32);
}

export function makeLimiter(rules = RULES) {
  const scans = []; // { at, visitor, site }
  return {
    scans,
    decide({ visitor, site, now }) {
      const dayAgo = now - DAY;
      const recent = scans.filter((s) => s.at > dayAgo);
      const cached = recent.find((s) => s.site === site && now - s.at < rules.domainCacheMs);
      if (cached) return { action: "serve_cached", from: cached.at }; // free: no fetch, no quota used
      if (recent.length >= rules.globalPerDay) return { action: "reject", reason: "busy" };
      if (recent.filter((s) => s.visitor === visitor).length >= rules.perVisitorPerDay) return { action: "reject", reason: "visitor_limit" };
      scans.push({ at: now, visitor, site });
      return { action: "scan" };
    },
  };
}

test("siteKey: every spelling of the same site maps to one key", () => {
  const same = ["https://www.Example.com/", "example.com", "HTTP://EXAMPLE.COM/about?x=1#y", "example.com.", "https://example.com:443/", "www.example.com/path"];
  for (const s of same) assert.equal(siteKey(s), "example.com", s);
});
test("siteKey: IDN and invalid input", () => {
  assert.equal(siteKey("https://bücher.example/"), "xn--bcher-kva.example");
  for (const bad of ["", "localhost", "ftp://example.com", "javascript:alert(1)", "http://", "not a url"]) assert.throws(() => siteKey(bad), undefined, bad);
});
test("visitorHash: stable within a day, different across days and people, never the raw IP", () => {
  const a = visitorHash("102.89.1.1", "s", "2026-10-10");
  assert.equal(a, visitorHash("102.89.1.1", "s", "2026-10-10"));
  assert.notEqual(a, visitorHash("102.89.1.1", "s", "2026-10-11"));
  assert.notEqual(a, visitorHash("102.89.1.2", "s", "2026-10-10"));
  assert.ok(!a.includes("102"));
});
test("per-visitor limit: 3 fresh sites ok, 4th rejected, then allowed again after 24h", () => {
  const l = makeLimiter(); const v = "V1"; let t = 1_000_000;
  for (const s of ["a.com", "b.com", "c.com"]) assert.equal(l.decide({ visitor: v, site: s, now: t++ }).action, "scan");
  assert.deepEqual(l.decide({ visitor: v, site: "d.com", now: t }), { action: "reject", reason: "visitor_limit" });
  assert.equal(l.decide({ visitor: v, site: "d.com", now: t + DAY + 10 }).action, "scan");
});
test("cache: re-scanning a site is free for everyone and does not use quota", () => {
  const l = makeLimiter(); let t = 5_000_000;
  assert.equal(l.decide({ visitor: "V1", site: "a.com", now: t }).action, "scan");
  for (let i = 0; i < 50; i++) assert.equal(l.decide({ visitor: `X${i}`, site: "a.com", now: t + 1000 + i }).action, "serve_cached");
  assert.equal(l.scans.length, 1);
  assert.equal(l.decide({ visitor: "V1", site: "a.com", now: t + DAY + 1 }).action, "scan"); // stale cache refreshes
});
test("IP rotation can't beat the global cap", () => {
  const l = makeLimiter({ ...RULES, globalPerDay: 10 }); let t = 9_000_000; const out = [];
  for (let i = 0; i < 15; i++) out.push(l.decide({ visitor: `bot${i}`, site: `site${i}.com`, now: t + i }));
  assert.equal(out.filter((o) => o.action === "scan").length, 10);
  assert.ok(out.slice(10).every((o) => o.reason === "busy"));
});
test("cached results still work when the global cap is hit (honest users aren't punished)", () => {
  const l = makeLimiter({ ...RULES, globalPerDay: 1 }); let t = 1;
  assert.equal(l.decide({ visitor: "A", site: "a.com", now: t }).action, "scan");
  assert.equal(l.decide({ visitor: "B", site: "a.com", now: t + 1 }).action, "serve_cached");
  assert.equal(l.decide({ visitor: "B", site: "b.com", now: t + 2 }).reason, "busy");
});
test("a rejected request does not consume quota", () => {
  const l = makeLimiter(); let t = 1; const v = "V";
  for (const s of ["a.com", "b.com", "c.com"]) l.decide({ visitor: v, site: s, now: t++ });
  const before = l.scans.length;
  for (let i = 0; i < 10; i++) l.decide({ visitor: v, site: `x${i}.com`, now: t + i });
  assert.equal(l.scans.length, before);
});
