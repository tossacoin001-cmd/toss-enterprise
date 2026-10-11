import { BlockList, isIP } from "node:net";

/**
 * Which addresses may our servers fetch on a stranger's behalf. One module,
 * used for the first request, every redirect hop, and every address a name
 * resolves to. Decision record: docs/01-architecture/decisions/0013.
 * Tests: tests/url-safety.test.ts, tests/ssrf.test.ts.
 */

// IANA special-purpose address registries (IPv4 and IPv6). Nothing here is a
// public website; several are internal cloud services (169.254.169.254).
const blocked = new BlockList();
const V4: Array<[string, number]> = [
  ["0.0.0.0", 8], // "this network"
  ["10.0.0.0", 8], // private
  ["100.64.0.0", 10], // carrier-grade NAT (also used inside some clouds)
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local, cloud metadata
  ["172.16.0.0", 12], // private
  ["192.0.0.0", 24], // IETF protocol assignments
  ["192.0.2.0", 24], // documentation
  ["192.88.99.0", 24], // 6to4 relay (deprecated)
  ["192.168.0.0", 16], // private
  ["198.18.0.0", 15], // benchmarking
  ["198.51.100.0", 24], // documentation
  ["203.0.113.0", 24], // documentation
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved, includes broadcast
];
const V6: Array<[string, number]> = [
  ["::", 128], // unspecified
  ["::1", 128], // loopback
  ["64:ff9b::", 96], // NAT64: can embed any IPv4, so blocked whole
  ["100::", 64], // discard
  ["2001::", 23], // IETF protocol assignments, includes Teredo
  ["2001:db8::", 32], // documentation
  ["2002::", 16], // 6to4: embeds an IPv4, blocked whole
  ["fc00::", 7], // unique local
  ["fe80::", 10], // link-local
  ["fec0::", 10], // site-local (deprecated)
  ["ff00::", 8], // multicast
];
for (const [net, prefix] of V4) blocked.addSubnet(net, prefix, "ipv4");
for (const [net, prefix] of V6) blocked.addSubnet(net, prefix, "ipv6");

/** IPv4 inside an IPv6 address (::ffff:a.b.c.d or ::ffff:aabb:ccdd), if any. */
function mappedIpv4(ip: string): string | null {
  const m = ip.toLowerCase().match(/^::ffff:(?:(\d+\.\d+\.\d+\.\d+)|([0-9a-f]{1,4}):([0-9a-f]{1,4}))$/);
  if (!m) return null;
  if (m[1]) return m[1];
  const hi = parseInt(m[2], 16);
  const lo = parseInt(m[3], 16);
  return `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`;
}

/** True when the address must never be contacted. Fails closed: anything that
 * is not a valid IP address counts as blocked. */
export function isBlockedIp(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) return blocked.check(ip, "ipv4");
  if (family === 6) {
    const v4 = mappedIpv4(ip);
    return v4 ? blocked.check(v4, "ipv4") : blocked.check(ip, "ipv6");
  }
  return true;
}

const MAX_URL_LENGTH = 2048;
const INTERNAL_SUFFIXES = [".local", ".localhost", ".internal", ".lan", ".home.arpa", ".corp", ".intranet", ".private"];

/**
 * Parses what an owner typed into a URL we are willing to fetch, or null.
 * Accepts a bare domain ("example.com") or an http(s) address; rejects ports
 * other than the scheme's own (so we cannot be used to probe other machines),
 * credentials, IP addresses of any kind, and local or internal names.
 */
export function isSafeExternalUrl(raw: string): URL | null {
  const text = raw.trim();
  if (!text || text.length > MAX_URL_LENGTH || /[\s\u0000-\u001f\u007f]/.test(text)) return null;

  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;
  // The URL parser drops a port that equals the scheme's default, so any port
  // left is a non-standard one.
  if (url.port !== "") return null;

  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!host.includes(".")) return null; // single-label names such as "intranet" (IPv6 literals too)
  if (host.startsWith("[") || isIP(host) !== 0) return null;
  if (INTERNAL_SUFFIXES.some((suffix) => host.endsWith(suffix))) return null;
  if (host.length > 253 || host.split(".").some((label) => label.length > 63)) return null;

  return url;
}
