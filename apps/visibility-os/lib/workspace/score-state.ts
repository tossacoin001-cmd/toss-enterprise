/**
 * What the dashboard may honestly say about a business's latest check. "No check yet", "a real zero"
 * and "we could not check this part" are three different things; the old dashboard turned all of them
 * into 0. Tests: tests/workspace/score-state.test.ts.
 */

export type ScoreRow = {
  total: number;
  googleScore: number;
  socialScore: number;
  websiteScore: number;
  reviewCount: number;
  avgRating: number;
  recordedAt: Date;
  /** This check's findings (JSON), when saved. Older rows have none. */
  findings: unknown;
};

type FindingLike = { group: string; state: string; points: number; earned: number };

export type Part = { kind: "score"; value: number } | { kind: "not_checked" } | { kind: "not_connected" };
export type ReviewsPart = { kind: "count"; count: number; rating: number | null } | { kind: "not_connected" };

export type ScoreView = {
  state: "none" | "checked" | "partial" | "stale";
  total: number | null;
  parts: { google: Part; website: Part; social: Part; reviews: ReviewsPart };
  /** Share of the check points that could be made, or null when this row saved no findings. */
  coverage: number | null;
  checkedText: string | null;
  canRecheck: boolean;
  recheckAvailableAt: number | null;
  recheckHint: string | null;
  primaryAction: "run_first_check" | "recheck";
};

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;
export const STALE_AFTER_MS = 10 * DAY; // a weekly check plus a few days of grace
export const RECHECK_COOLDOWN_MS = 5 * MINUTE;

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;

function readFindings(value: unknown): FindingLike[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter((x): x is FindingLike => !!x && typeof x === "object" && typeof (x as FindingLike).group === "string" && typeof (x as FindingLike).state === "string");
}

function agoText(ms: number): string {
  if (ms < MINUTE) return "just now";
  if (ms < HOUR) return `${plural(Math.floor(ms / MINUTE), "minute")} ago`;
  if (ms < DAY) return `${plural(Math.floor(ms / HOUR), "hour")} ago`;
  return `${plural(Math.floor(ms / DAY), "day")} ago`;
}

export function describeScore(row: ScoreRow | null, ctx: { hasGoogle: boolean }, now: number): ScoreView {
  if (!row) {
    return {
      state: "none",
      total: null,
      parts: {
        google: ctx.hasGoogle ? { kind: "not_checked" } : { kind: "not_connected" },
        website: { kind: "not_checked" },
        social: { kind: "not_checked" },
        reviews: { kind: "not_connected" },
      },
      coverage: null,
      checkedText: null,
      canRecheck: true,
      recheckAvailableAt: null,
      recheckHint: null,
      primaryAction: "run_first_check",
    };
  }

  const findings = readFindings(row.findings);
  const part = (group: "website" | "social", stored: number): Part => {
    if (!findings) return { kind: "score", value: stored };
    const own = findings.filter((f) => f.group === group);
    if (own.length > 0 && own.every((f) => f.state === "could_not_check")) return { kind: "not_checked" };
    return { kind: "score", value: stored };
  };

  let coverage: number | null = null;
  if (findings && findings.length > 0) {
    const all = findings.reduce((n, f) => n + f.points, 0);
    const settled = findings.filter((f) => f.state !== "could_not_check").reduce((n, f) => n + f.points, 0);
    coverage = all > 0 ? Math.round((settled / all) * 100) : null;
  }

  const age = Math.max(0, now - row.recordedAt.getTime());
  const state: ScoreView["state"] = age > STALE_AFTER_MS ? "stale" : coverage !== null && coverage < 100 ? "partial" : "checked";

  const availableAt = row.recordedAt.getTime() + RECHECK_COOLDOWN_MS;
  const canRecheck = now >= availableAt;
  const remaining = Math.max(0, availableAt - now);

  return {
    state,
    total: row.total,
    parts: {
      google: ctx.hasGoogle ? { kind: "score", value: row.googleScore } : { kind: "not_connected" },
      website: part("website", row.websiteScore),
      social: part("social", row.socialScore),
      reviews: ctx.hasGoogle ? { kind: "count", count: row.reviewCount, rating: row.avgRating > 0 ? row.avgRating : null } : { kind: "not_connected" },
    },
    coverage,
    checkedText: `Checked ${agoText(age)}`,
    canRecheck,
    recheckAvailableAt: canRecheck ? null : availableAt,
    recheckHint: canRecheck ? null : remaining < MINUTE ? "You can check again in under a minute." : `You can check again in about ${plural(Math.ceil(remaining / MINUTE), "minute")}.`,
    primaryAction: "recheck",
  };
}
