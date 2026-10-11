import { describe, expect, it } from "vitest";
import { verifySocial, type Verdict } from "@/lib/scan/social";
import { fakeNet, netError, res } from "./helpers";

// EN-12, SE-15. From Vercel's network (slice S0): YouTube, X and LinkedIn
// answer 200 for a real profile and 404 for a missing one. Instagram, Facebook
// and TikTok serve the same login page either way, so they are never checked
// and never reported as missing.

const T0 = 1_800_000_000_000;
const DAY = 24 * 3600 * 1000;

function setup(routes: Parameters<typeof fakeNet>[0], start = T0) {
  const net = fakeNet(routes);
  const clock = { t: start };
  const cache = new Map<string, Verdict>();
  const deps = { fetch: net.fetch, now: () => clock.t, cache };
  return { net, clock, cache, deps };
}

describe("platforms that can be verified", () => {
  it.each([
    ["x", "tossspa", "https://x.com/tossspa"],
    ["youtube", "@tossspa", "https://www.youtube.com/@tossspa"],
    ["linkedin", "toss-spa", "https://www.linkedin.com/company/toss-spa"],
  ] as const)("%s: 200 means live, 404 means missing", async (platform, handle, url) => {
    const live = setup({ [url]: res("<html>profile</html>") });
    expect((await verifySocial(platform, handle, live.deps)).verdict).toBe("live");
    const gone = setup({ [url]: res("not found", { status: 404 }) });
    expect((await verifySocial(platform, handle, gone.deps)).verdict).toBe("missing");
  });

  it.each([403, 429, 500, 503, 999])("HTTP %i is 'unknown', never 'missing'", async (status) => {
    // LinkedIn really answers 999 to automated visitors; the Response constructor refuses that status.
    const odd = { status, headers: new Headers(), body: null } as unknown as Response;
    const { deps } = setup({ "*": () => (status === 999 ? odd : res("x", { status })) });
    expect((await verifySocial("x", "tossspa", deps)).verdict).toBe("unknown");
  });

  it("a network error or a hang is 'unknown'", async () => {
    expect((await verifySocial("x", "tossspa", { ...setup({ "*": netError("ECONNRESET") }).deps })).verdict).toBe("unknown");
    expect((await verifySocial("x", "tossspa", { ...setup({ "*": "hang" }).deps, timeoutMs: 40 })).verdict).toBe("unknown");
  });

  it("identifies itself honestly and makes a single request", async () => {
    const { net, deps } = setup({ "*": res("ok") });
    await verifySocial("x", "tossspa", deps);
    expect(net.calls).toHaveLength(1);
    expect(net.requests[0].headers.get("user-agent")).toMatch(/TossVisibilityBot\/\d.*tossvisibilityos\.com/);
  });
});

describe("platforms that cannot be verified", () => {
  it.each(["instagram", "facebook", "tiktok"] as const)("%s is never requested and never called missing", async (platform) => {
    const { net, deps } = setup({ "*": res("login page") });
    const v = await verifySocial(platform, "tossspa", deps);
    expect(v.verdict).toBe("unverifiable");
    expect(net.calls).toEqual([]);
  });
});

describe("handles that could be used to point a request somewhere else", () => {
  it.each(["a/b", "../../etc", "toss spa", "x?y=1", "a#b", "http://evil.example", "", "a".repeat(200), "x@evil.example", "foo\nbar"])("%j is 'unknown' without any request", async (handle) => {
    const { net, deps } = setup({ "*": res("ok") });
    const v = await verifySocial("x", handle, deps);
    expect(v.verdict).toBe("unknown");
    expect(net.calls).toEqual([]);
  });
});

describe("24-hour cache (other companies' servers are not hammered)", () => {
  it("the second ask within a day makes no request and says it came from the cache", async () => {
    const { net, deps, clock } = setup({ "https://x.com/tossspa": res("ok") });
    const first = await verifySocial("x", "tossspa", deps);
    clock.t += DAY - 1000;
    const second = await verifySocial("x", "tossspa", deps);
    expect(net.calls).toHaveLength(1);
    expect(first.fromCache).toBe(false);
    expect(second).toMatchObject({ verdict: "live", fromCache: true });
  });

  it("after a day it asks again", async () => {
    const { net, deps, clock } = setup({ "https://x.com/tossspa": [res("ok"), res("gone", { status: 404 })] });
    await verifySocial("x", "tossspa", deps);
    clock.t += DAY + 1000;
    const again = await verifySocial("x", "tossspa", deps);
    expect(net.calls).toHaveLength(2);
    expect(again.verdict).toBe("missing");
  });

  it("an 'unknown' answer is remembered only briefly, so a blip does not stick for a day", async () => {
    const { net, deps, clock } = setup({ "https://x.com/tossspa": [res("x", { status: 503 }), res("ok")] });
    expect((await verifySocial("x", "tossspa", deps)).verdict).toBe("unknown");
    clock.t += 15 * 60 * 1000;
    expect((await verifySocial("x", "tossspa", deps)).verdict).toBe("live");
    expect(net.calls).toHaveLength(2);
  });

  it("different handles do not share an answer", async () => {
    const { net, deps } = setup({ "*": res("ok") });
    await verifySocial("x", "one", deps);
    await verifySocial("x", "two", deps);
    expect(net.calls).toHaveLength(2);
  });
});
