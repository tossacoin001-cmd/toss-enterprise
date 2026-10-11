/**
 * Shared shapes for the scan engine. Plan: docs/04-product/visibility-os-s1-engine-plan.md.
 */

/** Every check ends in one of three states; only the first two count toward a score. */
export type Evidence = "found" | "missing" | "could_not_check";

export type Priority = "HIGH" | "MEDIUM" | "LOW";

/** Which part of the score a finding belongs to. */
export type Group = "website" | "social" | "google";

export type SocialPlatform = "instagram" | "facebook" | "tiktok" | "x" | "youtube" | "linkedin";

/** Why a page could not be fetched. See fetch-page.ts for which are certain. */
export type FailureCause =
  | "domain_not_found"
  | "certificate_expired"
  | "certificate_untrusted"
  | "certificate_wrong_name"
  | "timeout"
  | "connection_failed"
  | "blocked"
  | "not_found"
  | "server_error"
  | "not_html"
  | "too_many_redirects"
  | "unsafe_address"
  | "invalid_url";

/** A reason on a finding: a failed fetch cause, or a page that loaded but is not a real site. */
export type FindingCause = FailureCause | "parked";

export type Finding = {
  id: string;
  group: Group;
  state: Evidence;
  priority: Priority;
  /** What it is, in plain words. */
  title: string;
  /** Why it matters to customers or money. */
  why: string;
  /** How to fix it, in a sentence. */
  fix: string;
  /** Realistic time to fix, in minutes. */
  minutes: number;
  /** Most this check can add to its group. Zero for warnings that cost nothing. */
  points: number;
  /** What it did add. Always 0 unless the state is "found". */
  earned: number;
  cause?: FindingCause;
  /** The page is built with JavaScript, so an absence may not be real. */
  caveat?: "js_built";
  /** Narrows the wording when one check can be missing in two different ways. */
  detail?: "broken_link" | "none_found";
};

export type ScanInput = {
  website?: string | null;
  name?: string | null;
  city?: string | null;
  category?: string | null;
  handles?: Partial<Record<SocialPlatform, string>>;
  whatsapp?: string | null;
};

export type PlanStep = {
  id: string;
  title: string;
  why: string;
  cost: "free" | "low" | "paid";
  minutes: number;
};

export type ScanReport = {
  path: "website" | "no_website";
  site?: { finalUrl: string; status: number; movedToOtherDomain: boolean; usedHttpFallback: boolean };
  findings: Finding[];
  /** Findings that are missing, in the order to fix them. */
  fixes: Finding[];
  topFixes: Finding[];
  /** Ids of findings that could not be checked. */
  couldNotCheck: string[];
  score: {
    website: number | null;
    social: number | null;
    total: number | null;
    earned: number;
    possible: number;
    pointsAvailable: number;
  };
  startHere?: PlanStep[];
  whatsapp?: { e164: string; link: string } | null;
  inputNote?: { kind: string; platform?: SocialPlatform; handle?: string };
  /** What the visitor told us about the business, kept with the result so the page can be personal. */
  meta?: { name?: string; city?: string; category?: string };
};
