import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Resolve names the way a real attacker could: an innocent-looking name that
// points at an internal address ("rebind*") and ordinary public names.
vi.mock("node:dns/promises", () => ({
  lookup: vi.fn(async (host: string) => {
    if (/^[\d.]+$/.test(host)) return [{ address: host, family: 4 }];
    return [{ address: host.startsWith("rebind") ? "127.0.0.1" : "93.184.216.34", family: 4 }];
  }),
}));

import { scoreBusiness as score, type BusinessInput } from "@/lib/scoring";

const scoreBusiness = (b: BusinessInput) => score(b, undefined, undefined, { certDaysLeft: async () => null });

// SE-01..SE-05. The scan fetches addresses typed by strangers, so the question
// is simple: does fetch() ever get called for an address it must not touch?

const calls: string[] = [];
beforeEach(() => {
  calls.length = 0;
  vi.stubEnv("GOOGLE_PLACES_API_KEY", "");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (u: unknown) => {
      calls.push(String(u));
      return new Response("<title>x</title>", { status: 200, headers: { "content-type": "text/html" } });
    })
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const base: BusinessInput = { name: "T", category: null, city: null, googlePlaceId: null, phoneNumber: null, instagramHandle: null, website: null };
const touched = async (website: string) => {
  await scoreBusiness({ ...base, website });
  return calls.length > 0;
};

describe("SE-01: addresses that must never be contacted", () => {
  it.each([
    "http://localhost", "http://127.0.0.1", "http://127.1", "http://0x7f000001", "http://2130706433", "http://017700000001",
    "http://0.0.0.0", "http://[::1]", "http://[::ffff:127.0.0.1]", "http://[::ffff:7f00:1]", "http://169.254.169.254/latest/meta-data/",
    "http://[fd00::1]", "http://[fe80::1]", "http://10.0.0.1", "http://172.16.0.1", "http://192.168.1.1",
    "ftp://example.com", "file:///etc/passwd", "gopher://example.com", "javascript:alert(1)",
    "http://rebind.attacker.example", // public-looking name that resolves to 127.0.0.1
  ])("%s", async (url) => {
    expect(await touched(url)).toBe(false);
  });

  it("a redirect to a loopback address is stopped before it is followed", async () => {
    vi.stubGlobal("fetch", vi.fn(async (u: unknown) => {
      calls.push(String(u));
      return new Response(null, { status: 302, headers: { location: "http://127.0.0.1:3001/" } });
    }));
    await scoreBusiness({ ...base, website: "https://toss.example" });
    expect(calls).toHaveLength(1);
  });
});

// KNOWN GAPS, found by the 2026-10-10 probe. `it.fails` passes while the bug
// exists and turns RED the day it is fixed: then change `it.fails` to `it`.
describe("closed gaps: ports, credentials and reserved ranges", () => {
  it("SE-02: only ports 80 and 443 are contacted (6379, 22, 25 and 8443 were requested before 2026-10-11)", async () => {
    for (const url of ["http://example.com:6379", "http://example.com:22", "https://example.com:25", "https://example.com:8443"]) {
      calls.length = 0;
      expect(await touched(url), url).toBe(false);
    }
  });

  it("SE-03: credentials in a URL are rejected (they were sent before 2026-10-11)", async () => {
    expect(await touched("http://user:pass@example.com")).toBe(false);
  });

  it("SE-04: reserved ranges are blocked: 100.64/10, 198.18/15, 192.0.0.0/24, multicast, broadcast (all were requested before 2026-10-11)", async () => {
    for (const url of ["http://100.64.0.1", "http://198.18.0.1", "http://192.0.0.1", "http://224.0.0.1", "http://255.255.255.255"]) {
      calls.length = 0;
      expect(await touched(url), url).toBe(false);
    }
  });
});


describe("redirects cannot smuggle the scan to a place it must not go", () => {
  const redirectTo = (location: string) =>
    vi.fn(async (u: unknown) => {
      calls.push(String(u));
      return calls.length === 1
        ? new Response(null, { status: 302, headers: { location } })
        : new Response("<title>x</title>", { status: 200, headers: { "content-type": "text/html" } });
    });

  it.each([
    "http://example.com:8080/", "https://example.com:6379/", "https://user:pass@example.com/", "http://100.64.0.1/",
    "http://169.254.169.254/latest/meta-data/", "ftp://example.com/", "http://[::1]/", "http://192.168.0.1/",
    "http://rebind.attacker.example/",
  ])("a redirect to %s is not followed", async (target) => {
    vi.stubGlobal("fetch", redirectTo(target));
    await scoreBusiness({ ...base, website: "https://toss.example" });
    expect(calls).toHaveLength(1);
  });

  it("an ordinary redirect (http to https, www) is still followed", async () => {
    vi.stubGlobal("fetch", redirectTo("https://www.toss.example/"));
    await scoreBusiness({ ...base, website: "http://toss.example" });
    // The first page, the redirect target, and the two small file checks on the final site.
    expect(calls.slice(0, 2)).toEqual(["http://toss.example/", "https://www.toss.example/"]);
    expect(calls.every((u) => /^https?:\/\/(www\.)?toss\.example\//.test(u))).toBe(true);
  });
});
