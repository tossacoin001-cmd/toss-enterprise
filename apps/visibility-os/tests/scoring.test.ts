import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Hostnames starting with "internal" resolve to a private address; everything
// else resolves to a public one. Hoisted so scoring.ts sees the mock.
vi.mock("node:dns/promises", () => ({
  lookup: vi.fn(async (host: string) => [
    { address: host.startsWith("internal") ? "10.0.0.5" : "93.184.216.34", family: 4 },
  ]),
}));

import {
  SPEED_FULL_POINTS,
  isSafeExternalUrl,
  metaContent,
  scoreBusiness,
  speedPoints,
  type BusinessInput,
} from "@/lib/scoring";

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

describe("metaContent", () => {
  // Regression: a regex that required quoted attributes in name-then-content
  // order reported minified sites as "not mobile-friendly" (HIGH priority).
  it.each([
    ["<meta name=viewport content=\"width=device-width,initial-scale=1\">", "viewport", "width=device-width,initial-scale=1"],
    ['<meta name="viewport" content="width=device-width">', "viewport", "width=device-width"],
    ["<meta content='Best spa in Lekki for massages' name='description'>", "description", "Best spa in Lekki for massages"],
    ['<META NAME=Description CONTENT="Award winning bakery in Ikeja">', "description", "Award winning bakery in Ikeja"],
    ['<meta property="og:description" content="not the right tag at all">', "description", null],
    ["<meta charset=utf-8>", "viewport", null],
    ['<meta name="twitter:description" content="x"><meta name="description" content="the real long one">', "description", "the real long one"],
  ])("%s -> %s", (tag, name, expected) => {
    expect(metaContent(tag, name)).toBe(expected);
  });
});

describe("speedPoints", () => {
  // Regression: a hard 3s cutoff flipped the score by 10 between identical runs.
  it("is tiered, not a cliff", () => {
    expect(speedPoints(800)).toBe(SPEED_FULL_POINTS);
    expect(speedPoints(3500)).toBe(SPEED_FULL_POINTS);
    expect(speedPoints(4000)).toBe(SPEED_FULL_POINTS);
    expect(speedPoints(6500)).toBe(SPEED_FULL_POINTS / 2);
    expect(speedPoints(9000)).toBe(0);
  });
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
  it("gives full marks to a minified, modern page and flags nothing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        html(
          "<!doctype html><title>Toss Spa Lagos</title><meta name=viewport content=\"width=device-width,initial-scale=1\"><meta content='Relaxing massages and facials in Lekki, Lagos' name=description>"
        )
      )
    );
    const r = await scoreBusiness(business());
    expect(r.websiteScore).toBe(100);
    expect(titles(r).filter((t) => /website|mobile|description|Speed/i.test(t))).toEqual([]);
  });

  it("flags a page that really lacks the tags", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => html("<html><body>hi</body></html>")));
    const r = await scoreBusiness(business());
    expect(titles(r)).toEqual(
      expect.arrayContaining([
        "Add a page title to your website",
        "Add a search description to your website",
        "Make your website mobile-friendly",
      ])
    );
  });

  it("blocks a redirect to a loopback address (SSRF)", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 302, headers: { location: "http://127.0.0.1:3001/" } }));
    vi.stubGlobal("fetch", fetchMock);
    const r = await scoreBusiness(business());
    expect(r.websiteScore).toBe(0);
    expect(titles(r)).toContain("Your website is unreachable");
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
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(r.websiteScore).toBeGreaterThanOrEqual(30);
  });

  it("asks for a website when none is on file", async () => {
    const r = await scoreBusiness(business({ website: null }));
    expect(titles(r)).toContain("Get a website");
    expect(r.websiteScore).toBe(0);
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
