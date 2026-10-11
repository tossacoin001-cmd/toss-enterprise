import { isIP } from "node:net";
import { domainToASCII } from "node:url";

/**
 * One canonical key per website, so www, capital letters, paths, ports, a trailing dot
 * or an international spelling cannot dodge the shared cache or the daily limits.
 * Throws for anything that is not a public-looking domain name. Tests: tests/scan-limits/site-key.test.ts.
 */
export function siteKey(input: string): string {
  const raw = String(input).trim();
  if (!raw || raw.length > 2000) throw new Error("bad address");
  const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("bad scheme");
  const host = domainToASCII(url.hostname.toLowerCase().replace(/\.$/, ""));
  if (!host || host.length > 253 || !host.includes(".") || host.startsWith("[") || isIP(host) !== 0) throw new Error("bad host");
  return host.replace(/^www\./, "");
}
