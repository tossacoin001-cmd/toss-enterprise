import { describe, expect, it } from "vitest";
import { addBrowserSite, browserSites, clientIp, visitorHash, watDay } from "@/lib/scan-limits/visitor";

const SECRET = "test-secret-at-least-32-characters-long!!";

describe("AB-02: visitor hash", () => {
  it("is stable within a day, differs across days and people, and never contains the address", () => {
    const a = visitorHash("102.89.1.1", "salt", "2026-10-10");
    expect(a).toBe(visitorHash("102.89.1.1", "salt", "2026-10-10"));
    expect(a).not.toBe(visitorHash("102.89.1.1", "salt", "2026-10-11"));
    expect(a).not.toBe(visitorHash("102.89.1.2", "salt", "2026-10-10"));
    expect(a).not.toContain("102");
    expect(a).toMatch(/^[0-9a-f]{32}$/);
  });
});

describe("AB-11: the day is Lagos time (WAT, UTC+1, no clock changes)", () => {
  it.each([
    ["2026-10-10T22:59:59Z", "2026-10-10"],
    ["2026-10-10T23:00:00Z", "2026-10-11"],
    ["2026-12-31T23:30:00Z", "2027-01-01"],
    ["2026-03-29T00:30:00Z", "2026-03-29"], // a date when European clocks change; Lagos does not
  ])("%s is %s", (iso, day) => expect(watDay(Date.parse(iso))).toBe(day));
});

describe("AB-16: only the address Vercel sets is trusted", () => {
  const h = (o: Record<string, string>) => new Headers(o);
  it("uses x-vercel-forwarded-for and ignores headers a visitor can send", () => {
    expect(clientIp(h({ "x-vercel-forwarded-for": "102.89.1.1", "x-forwarded-for": "6.6.6.6", "x-real-ip": "7.7.7.7" }))).toBe("102.89.1.1");
  });
  it("without it, a spoofed forwarding header does not change who the visitor is", () => {
    expect(clientIp(h({ "x-forwarded-for": "6.6.6.6" }))).toBeNull();
    expect(clientIp(h({ "x-real-ip": "7.7.7.7" }))).toBeNull();
  });
  it("takes only the first address and rejects junk", () => {
    expect(clientIp(h({ "x-vercel-forwarded-for": "102.89.1.1, 10.0.0.1" }))).toBe("102.89.1.1");
    expect(clientIp(h({ "x-vercel-forwarded-for": "not an ip" }))).toBeNull();
    expect(clientIp(h({ "x-vercel-forwarded-for": "2001:db8::1" }))).toBe("2001:db8::1");
  });
});

describe("AB-09: signed browser cookie", () => {
  it("remembers the sites scanned today, in order, without duplicates", () => {
    let c = addBrowserSite(undefined, "a.com", "2026-10-10", SECRET);
    c = addBrowserSite(c, "b.com", "2026-10-10", SECRET);
    c = addBrowserSite(c, "a.com", "2026-10-10", SECRET);
    expect(browserSites(c, "2026-10-10", SECRET)).toEqual(["a.com", "b.com"]);
  });
  it("forgets yesterday's sites", () => {
    const c = addBrowserSite(undefined, "a.com", "2026-10-10", SECRET);
    expect(browserSites(c, "2026-10-11", SECRET)).toEqual([]);
  });
  it("a changed, forged or garbage cookie counts as empty, never as an error", () => {
    const c = addBrowserSite(undefined, "a.com", "2026-10-10", SECRET);
    expect(browserSites(c.replace("a.com", "z.com"), "2026-10-10", SECRET)).toEqual([]);
    expect(browserSites(c, "2026-10-10", "another-secret-another-secret-123456")).toEqual([]);
    for (const junk of [undefined, "", "x", "v1.", "v1...", "v1.2026-10-10.a.com.", "💥".repeat(500)]) {
      expect(browserSites(junk, "2026-10-10", SECRET)).toEqual([]);
    }
  });
  it("stays small even when a script keeps adding sites", () => {
    let c = "";
    for (let i = 0; i < 200; i++) c = addBrowserSite(c, `site${i}.com`, "2026-10-10", SECRET);
    expect(c.length).toBeLessThan(1000);
  });
});
