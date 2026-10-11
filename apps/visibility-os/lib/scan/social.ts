import type { SocialPlatform } from "./types";

/**
 * Does a social profile exist? Only where a server can honestly tell.
 * From Vercel's network (slice S0, 2026-10-10): YouTube, X and LinkedIn answer
 * 200 for a real profile and 404 for a missing one. Instagram, Facebook and
 * TikTok serve the same login page either way, so they are never requested and
 * never called missing. Anything unclear is "unknown", never "missing".
 * Tests: tests/engine/social.test.ts.
 */

export type Verdict = {
  verdict: "live" | "missing" | "unknown" | "unverifiable";
  fromCache: boolean;
  checkedAt: number;
};

export type SocialDeps = {
  fetch?: typeof fetch;
  now?: () => number;
  cache?: Map<string, Verdict>;
  timeoutMs?: number;
};

const USER_AGENT = "TossVisibilityBot/1.0 (+https://tossvisibilityos.com)";
const DAY_MS = 24 * 60 * 60 * 1000;
const UNKNOWN_TTL_MS = 10 * 60 * 1000; // a blip must not stick for a day

export const VERIFIABLE: ReadonlySet<SocialPlatform> = new Set<SocialPlatform>(["x", "youtube", "linkedin"]);

// Handles are placed into a fixed address on a fixed site, so only plain
// characters are allowed: nothing here can point a request somewhere else.
const SAFE_HANDLE: Partial<Record<SocialPlatform, RegExp>> = {
  x: /^[A-Za-z0-9_]{1,15}$/,
  youtube: /^@[A-Za-z0-9._-]{3,30}$/,
  linkedin: /^[A-Za-z0-9_%-]{2,100}$/,
};

function profileUrl(platform: SocialPlatform, handle: string): string | null {
  const ok = SAFE_HANDLE[platform];
  if (!ok || !ok.test(handle)) return null;
  switch (platform) {
    case "x":
      return `https://x.com/${handle}`;
    case "youtube":
      return `https://www.youtube.com/${handle}`;
    case "linkedin":
      return `https://www.linkedin.com/company/${handle}`;
    default:
      return null;
  }
}

const defaultCache = new Map<string, Verdict>();

export async function verifySocial(platform: SocialPlatform, handle: string, deps: SocialDeps = {}): Promise<Verdict> {
  const now = deps.now ?? Date.now;
  const doFetch = deps.fetch ?? fetch;
  const cache = deps.cache ?? defaultCache;
  const t = now();

  if (!VERIFIABLE.has(platform)) return { verdict: "unverifiable", fromCache: false, checkedAt: t };

  const url = profileUrl(platform, handle);
  if (!url) return { verdict: "unknown", fromCache: false, checkedAt: t };

  const key = `${platform}:${handle.toLowerCase()}`;
  const hit = cache.get(key);
  if (hit) {
    const ttl = hit.verdict === "unknown" ? UNKNOWN_TTL_MS : DAY_MS;
    if (t - hit.checkedAt < ttl) return { ...hit, fromCache: true };
  }

  let verdict: Verdict["verdict"] = "unknown";
  try {
    const res = await doFetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(deps.timeoutMs ?? 5000),
      headers: { "user-agent": USER_AGENT, accept: "text/html,*/*;q=0.5" },
    });
    verdict = res.status === 200 ? "live" : res.status === 404 ? "missing" : "unknown";
    await Promise.race([res.body?.cancel().catch(() => undefined), new Promise<void>((r) => setTimeout(r, 50))]);
  } catch {
    verdict = "unknown";
  }

  const result: Verdict = { verdict, fromCache: false, checkedAt: t };
  cache.set(key, result);
  return result;
}
