import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:dns/promises", () => ({
  lookup: vi.fn(async () => [{ address: "93.184.216.34", family: 4 }]),
}));

import { scoreBusiness, type BusinessInput } from "@/lib/scoring";

// SC-01 / SC-02 / SC-05: properties of the score that must hold for ANY input,
// checked over many pseudo-random combinations (seeded, so failures reproduce).

type Flags = {
  website: boolean;
  https: boolean;
  title: boolean;
  description: boolean;
  viewport: boolean;
  placeId: boolean;
  phone: boolean;
  category: boolean;
  city: boolean;
  instagram: boolean;
};
const KEYS = Object.keys({
  website: 0, https: 0, title: 0, description: 0, viewport: 0, placeId: 0, phone: 0, category: 0, city: 0, instagram: 0,
} satisfies Record<keyof Flags, number>) as Array<keyof Flags>;

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pageFor(f: Flags): string {
  return [
    f.title ? "<title>Toss Spa Lagos</title>" : "",
    f.description ? '<meta name="description" content="Relaxing massages and facials in Lekki, Lagos">' : "",
    f.viewport ? '<meta name="viewport" content="width=device-width">' : "",
  ].join("");
}

async function scoreFor(f: Flags): Promise<number> {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(pageFor(f), { status: 200, headers: { "content-type": "text/html" } })));
  const input: BusinessInput = {
    name: "Toss Spa",
    category: f.category ? "Spa & Wellness" : null,
    city: f.city ? "Lagos" : null,
    googlePlaceId: f.placeId ? "ChIJ-test" : null,
    phoneNumber: f.phone ? "+2348000000000" : null,
    website: f.website ? `${f.https ? "https" : "http"}://toss.example` : null,
    instagramHandle: f.instagram ? "tossspa" : null,
  };
  return (await scoreBusiness(input)).total;
}

const randomFlags = (rand: () => number): Flags =>
  Object.fromEntries(KEYS.map((k) => [k, rand() < 0.5])) as Flags;

beforeEach(() => vi.stubEnv("GOOGLE_PLACES_API_KEY", ""));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("score properties", () => {
  it("SC-01: is always an integer from 0 to 100 (all 1024 combinations)", async () => {
    for (let n = 0; n < 1 << KEYS.length; n++) {
      const f = Object.fromEntries(KEYS.map((k, i) => [k, Boolean(n & (1 << i))])) as Flags;
      const s = await scoreFor(f);
      expect(Number.isInteger(s), JSON.stringify(f)).toBe(true);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    }
  }, 120_000);

  it("SC-02: fixing something never lowers the score (500 random before/after pairs)", async () => {
    const rand = mulberry32(20261010);
    for (let i = 0; i < 500; i++) {
      const before = randomFlags(rand);
      const after = { ...before } as Flags;
      // "Fix" one or more things that are currently missing.
      for (const k of KEYS) if (!before[k] && rand() < 0.4) after[k] = true;
      const [b, a] = [await scoreFor(before), await scoreFor(after)];
      expect(a, `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`).toBeGreaterThanOrEqual(b);
    }
  }, 120_000);

  it("SC-05: the same inputs always give the same score", async () => {
    const rand = mulberry32(7);
    for (let i = 0; i < 50; i++) {
      const f = randomFlags(rand);
      expect(await scoreFor(f)).toBe(await scoreFor(f));
    }
  }, 60_000);
});
