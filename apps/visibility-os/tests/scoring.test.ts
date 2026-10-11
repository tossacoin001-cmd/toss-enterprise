import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Hostnames starting with "internal" resolve to a private address; everything
// else resolves to a public one. Hoisted so scoring.ts sees the mock.
vi.mock("node:dns/promises", () => ({
  lookup: vi.fn(async (host: string) => [
    { address: host.startsWith("internal") ? "10.0.0.5" : "93.184.216.34", family: 4 },
  ]),
}));

import { isSafeExternalUrl, scoreBusiness as score, type BusinessInput } from "@/lib/scoring";

// The page, speed and social checks now live in the scan engine (lib/scan, ADR-0015) and are
// tested in tests/engine/. This file covers how scoring wires them in. The certificate lookup
// would open a real connection, so it is switched off here.
const scoreBusiness = (b: BusinessInput) => score(b, undefined, undefined, { certDaysLeft: async () => null });

const business = (over: Partial<BusinessInput> = {}): BusinessInput => ({
  name: "Toss Spa",
  category: "Spa & Wellness",
  city: "Lagos",
  googlePlaceId: null,
  phoneNumber: "+2348000000000",
  website: "https://toss.example",
  instagramHandle: "tossspa",
  ...over,
});

const html = (body: string) => new Response(body, { status: 200, headers: { "content-type": "text/html" } });
const titles = (r: Awaited<ReturnType<typeof scoreBusiness>>) => r.actionItems.map((a) => a.title);

beforeEach(() => {
  vi.stubEnv("GOOGLE_PLACES_API_KEY", "");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("isSafeExternalUrl", () => {
  it.each(["http://localhost", "http://127.0.0.1:3001", "http://10.1.2.3", "http://192.168.0.5", "http://172.20.1.1", "ftp://example.com", "http://intranet"])(
    "rejects %s",
    (u) => expect(isSafeExternalUrl(u)).toBeNull()
  );
  it("accepts a public site and adds https to a bare domain", () => {
    expect(isSafeExternalUrl("example.com")?.toString()).toBe("https://example.com/");
  });
});

describe("website check", () => {
  it("a minified, modern page passes the title, description and phone checks", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        html(
          "<!doctype html><title>Toss Spa Lagos</title><meta name=viewport content=\"width=device-width,initial-scale=1\"><meta content='Relaxing massages and facials in Lekki, Lagos' name=description>"
        )
      )
    );
    const r = await scoreBusiness(business());
    const website = r.actionItems.filter((a) => a.category === "Website").map((a) => a.title);
    expect(website.some((t) => /title|short description|phone screens/i.test(t))).toBe(false);
    expect(r.websiteScore).toBeGreaterThan(70);
  });

  it("flags a page that really lacks the tags", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => html("<html><body>hi</body></html>")));
    const r = await scoreBusiness(business());
    expect(titles(r)).toEqual(
      expect.arrayContaining(["Your home page has no title", "Your home page has no short description for Google", "Your site may not fit phone screens"])
    );
  });

  it("blocks a redirect to a loopback address (SSRF)", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 302, headers: { location: "http://127.0.0.1:3001/" } }));
    vi.stubGlobal("fetch", fetchMock);
    const r = await scoreBusiness(business());
    // We could not look, so we claim nothing about the site and the score is not made up.
    expect(r.websiteScore).toBe(0);
    expect(r.actionItems.filter((a) => a.category === "Website")).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("blocks a public-looking hostname that resolves to a private address (DNS rebinding)", async () => {
    const fetchMock = vi.fn(async () => html("<title>x</title>"));
    vi.stubGlobal("fetch", fetchMock);
    const r = await scoreBusiness(business({ website: "https://internal.attacker.example" }));
    expect(r.websiteScore).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("follows a safe redirect chain and checks the final page", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 301, headers: { location: "https://www.toss.example/" } }))
      .mockResolvedValueOnce(html("<title>Toss</title>"));
    vi.stubGlobal("fetch", fetchMock);
    const r = await scoreBusiness(business());
    expect(fetchMock.mock.calls.slice(0, 2).map((c) => String(c[0]))).toEqual(["https://toss.example/", "https://www.toss.example/"]);
    expect(r.websiteScore).toBeGreaterThanOrEqual(25);
  });

  it("asks for a website when none is on file", async () => {
    const r = await scoreBusiness(business({ website: null }));
    expect(titles(r)).toContain("Add a website of your own");
    expect(r.websiteScore).toBe(0);
  });
});

describe("social check", () => {
  it("an Instagram handle on its own is not proof, so it no longer earns a perfect social score", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => html("<html><body>hi</body></html>")));
    const r = await scoreBusiness(business());
    expect(r.socialScore).toBeLessThan(100);
  });

  it("keeps the last known score when a part could not be checked this time", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("denied", { status: 403 })));
    const r = await score(business(), undefined, { reviewCount: 0, avgRating: 0, websiteScore: 80, socialScore: 40 }, { certDaysLeft: async () => null, retryDelayMs: 0 });
    expect(r.websiteScore).toBe(80);
  });
});

describe("google check without a Places key", () => {
  it("tells the owner where to connect a listing, not to search 'above'", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => html("<title>Toss</title>")));
    const r = await scoreBusiness(business());
    const item = r.actionItems.find((a) => a.title === "Claim your Google Business Profile");
    expect(item?.description).toContain("Connect your Google Business Profile");
    expect(item?.description).not.toMatch(/above/i);
  });

  it("still credits a verified listing when live data is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => html("<title>Toss</title>")));
    const r = await scoreBusiness(business({ googlePlaceId: "ChIJ-test" }));
    expect(r.googleScore).toBe(100);
    expect(titles(r)).not.toContain("Claim your Google Business Profile");
  });
});
