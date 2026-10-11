import { describe, expect, it } from "vitest";
import { isBlockedIp, isSafeExternalUrl } from "@/lib/url-safety";

// SE-01..SE-05, IN-04. A stranger types the address we fetch, so every address
// we must not touch is listed here, with the edges of each range.

describe("isBlockedIp: IPv4 special-use ranges (edges included)", () => {
  it.each([
    "0.0.0.0", "0.255.255.255", // 0/8 "this network"
    "10.0.0.0", "10.255.255.255", // private
    "100.64.0.0", "100.127.255.255", // carrier-grade NAT
    "127.0.0.1", "127.255.255.255", // loopback
    "169.254.0.0", "169.254.169.254", "169.254.255.255", // link-local, cloud metadata
    "172.16.0.0", "172.31.255.255", // private
    "192.0.0.0", "192.0.0.255", // IETF protocol assignments
    "192.0.2.1", "198.51.100.1", "203.0.113.1", // documentation ranges
    "192.88.99.1", // 6to4 relay (deprecated)
    "192.168.0.1", "192.168.255.255", // private
    "198.18.0.0", "198.19.255.255", // benchmarking
    "224.0.0.1", "239.255.255.255", // multicast
    "240.0.0.1", "255.255.255.254", "255.255.255.255", // reserved, broadcast
  ])("blocks %s", (ip) => expect(isBlockedIp(ip)).toBe(true));

  it.each([
    "1.1.1.1", "8.8.8.8", "93.184.216.34", "140.82.121.3", "41.58.0.1", "102.89.0.1", // ordinary public
    "100.63.255.255", "100.128.0.0", // just outside carrier-grade NAT
    "172.15.255.255", "172.32.0.0", // just outside 172.16/12
    "192.0.1.1", "198.17.255.255", "198.20.0.0", // just outside the special ranges
    "223.255.255.255",
  ])("allows %s", (ip) => expect(isBlockedIp(ip)).toBe(false));
});

describe("isBlockedIp: IPv6", () => {
  it.each([
    "::", "::1",
    "::ffff:127.0.0.1", "::ffff:7f00:1", "::ffff:10.0.0.1", "::ffff:169.254.169.254", // IPv4-mapped
    "64:ff9b::7f00:1", "64:ff9b::a00:1", // NAT64 embedding a private IPv4
    "2002:7f00:1::1", "2002:a00:1::1", // 6to4 embedding a private IPv4
    "2001:db8::1", "2001::1", // documentation, Teredo
    "100::1", // discard
    "fc00::1", "fd12:3456::1", // unique local
    "fe80::1", "fec0::1", // link-local, site-local
    "ff02::1", // multicast
  ])("blocks %s", (ip) => expect(isBlockedIp(ip)).toBe(true));

  it.each(["2606:4700:4700::1111", "2a00:1450:4009:81a::200e", "::ffff:8.8.8.8"])("allows %s", (ip) =>
    expect(isBlockedIp(ip)).toBe(false)
  );

  it("fails closed on anything that is not an IP address", () => {
    for (const bad of ["", "not-an-ip", "999.1.1.1", "1.2.3", "1.2.3.4.5", "::g"]) expect(isBlockedIp(bad), bad).toBe(true);
  });
});

describe("isSafeExternalUrl: accepted", () => {
  it.each([
    ["example.com", "https://example.com/"],
    ["https://example.com", "https://example.com/"],
    ["http://example.com", "http://example.com/"],
    ["http://example.com:80", "http://example.com/"],
    ["https://example.com:443/", "https://example.com/"],
    ["https://www.Example.COM/Path?x=1", "https://www.example.com/Path?x=1"],
    ["example.com/about", "https://example.com/about"],
    ["https://bücher.example/", "https://xn--bcher-kva.example/"],
    ["https://smileydentalclinic.com.ng/", "https://smileydentalclinic.com.ng/"],
  ])("%s", (input, expected) => expect(isSafeExternalUrl(input)?.toString()).toBe(expected));
});

describe("isSafeExternalUrl: rejected", () => {
  it.each([
    // ports other than the scheme's own: a stranger must not use us to probe other machines
    "http://example.com:6379", "http://example.com:22", "https://example.com:25", "https://example.com:8443",
    "http://example.com:8080", "http://example.com:3000", "https://example.com:80", "http://example.com:443",
    // credentials in the URL
    "http://user:pass@example.com", "https://user@example.com", "https://:pass@example.com",
    // IP addresses of any kind, public ones too: we scan websites by name
    "http://127.0.0.1", "http://8.8.8.8", "https://93.184.216.34", "http://[::1]", "http://[2606:4700:4700::1111]",
    "http://2130706433", "http://0x7f000001", "http://017700000001", "http://127.1",
    // local and internal names
    "http://localhost", "http://intranet", "http://printer.local", "http://app.localhost", "http://db.internal",
    "http://router.lan", "http://nas.home.arpa", "http://server.corp",
    // other schemes
    "ftp://example.com", "file:///etc/passwd", "gopher://example.com", "javascript:alert(1)", "data:text/html,hi", "ws://example.com",
    // junk
    "", "   ", "not a url", "http://", "https://exa mple.com", "https://example.com\nHost: evil.com",
    `https://${"a".repeat(300)}.com`, `https://example.com/${"a".repeat(3000)}`,
  ])("%j", (input) => expect(isSafeExternalUrl(input)).toBeNull());
});
