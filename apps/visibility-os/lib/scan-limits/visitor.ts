import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";

/**
 * Who is asking, without keeping who they are. No raw address is ever stored: the visitor
 * hash uses a daily-changing salt, so a stored hash cannot be tied to a person across days.
 * Tests: tests/scan-limits/visitor.test.ts.
 */

const WAT_OFFSET_MS = 60 * 60 * 1000; // Lagos is UTC+1 all year, with no clock changes

/** The calendar day in Lagos, like 2026-10-10. Daily limits reset at midnight there. */
export const watDay = (now: number): string => new Date(now + WAT_OFFSET_MS).toISOString().slice(0, 10);

/** When that Lagos day began, in milliseconds. */
export const watDayStart = (now: number): number => Date.parse(`${watDay(now)}T00:00:00Z`) - WAT_OFFSET_MS;

export const visitorHash = (ip: string, salt: string, day: string): string =>
  createHash("sha256").update(`${salt}:${day}:${ip}`).digest("hex").slice(0, 32);

/**
 * The visitor's network address. Only the header Vercel itself sets is trusted: a visitor can
 * send any x-forwarded-for they like, but cannot change x-vercel-forwarded-for.
 */
export function clientIp(headers: Headers): string | null {
  const first = headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  return first && isIP(first) !== 0 ? first : null;
}

// ---- the signed cookie: which new sites this browser scanned today ------------------------

const VERSION = "v1";
const MAX_REMEMBERED = 10;

const sign = (day: string, sites: string, secret: string) => createHmac("sha256", secret).update(`${day}~${sites}`).digest("hex").slice(0, 32);

/** Sites this browser has scanned today. A changed, forged or broken cookie counts as empty. */
export function browserSites(cookie: string | undefined, day: string, secret: string): string[] {
  if (!cookie || cookie.length > 2000) return [];
  const parts = cookie.split("~");
  if (parts.length !== 4 || parts[0] !== VERSION || parts[1] !== day) return [];
  const [, , sites, sig] = parts;
  const expected = Buffer.from(sign(day, sites, secret));
  const given = Buffer.from(sig);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return [];
  return sites ? sites.split(",") : [];
}

/** The new cookie value after this browser scans one more site. */
export function addBrowserSite(cookie: string | undefined, site: string, day: string, secret: string): string {
  const sites = browserSites(cookie, day, secret);
  if (!sites.includes(site)) sites.push(site);
  const kept = sites.slice(-MAX_REMEMBERED).join(",");
  return `${VERSION}~${day}~${kept}~${sign(day, kept, secret)}`;
}
