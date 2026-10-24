import "server-only";
import { getPlaceDetails } from "./google-places";
import { runScan, type Finding, type ScanDeps, type ScanReport } from "./scan";
import { isSafeExternalUrl } from "./url-safety";

/**
 * Visibility scoring: deterministic checks, backed by a real Google Places
 * lookup for the Google subscore and by the scan engine (lib/scan) for the
 * website and social subscores. Weights: Google presence 40%, website 40%, social 20%. The visibility-agent
 * (docs/03-ai/agents/visibility-agent.md) will extend this with a scheduled
 * cadence and social data later; the same subscore fields are reused, so the
 * dashboard needs no changes when it does.
 * Decision records: docs/01-architecture/decisions/0007, 0009.
 */

export type BusinessInput = {
  name: string;
  category: string | null;
  city: string | null;
  googlePlaceId: string | null;
  phoneNumber: string | null;
  website: string | null;
  instagramHandle: string | null;
};

export type ActionItemDraft = {
  /** The finding this came from (like page.title), so a rescan updates the item instead of duplicating it. */
  key: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  category: "Google" | "Website" | "Social" | "Profile";
};

export type ScoreResult = {
  total: number;
  googleScore: number;
  socialScore: number;
  websiteScore: number;
  reviewCount: number;
  avgRating: number;
  actionItems: ActionItemDraft[];
  /** What the scan found, kept so the weekly watch can say what changed. */
  report: ScanReport;
};

export { isSafeExternalUrl };

/** Last known scores, used only when a part could not be checked this time. */
export type PreviousScores = { reviewCount: number; avgRating: number; websiteScore?: number; socialScore?: number };

type WebsiteCheck = {
  score: number;
  actionItems: ActionItemDraft[];
};

/** Website and social checks come from the scan engine (lib/scan, ADR-0015): only what could be
 * checked counts, and a page we could not reach never becomes a claim about the owner. When a part
 * could not be checked at all, the last known score is kept so one bad moment does not move it. */
async function checkWebsiteAndSocial(
  b: BusinessInput,
  previous: PreviousScores | undefined,
  engineDeps: ScanDeps | undefined
): Promise<{ website: WebsiteCheck; social: WebsiteCheck; report: ScanReport }> {
  const report = await runScan(
    {
      website: b.website,
      name: b.name,
      city: b.city,
      category: b.category,
      handles: b.instagramHandle && b.instagramHandle.trim() ? { instagram: b.instagramHandle } : undefined,
    },
    engineDeps
  );
  const draft = (f: Finding): ActionItemDraft => ({
    key: f.id,
    title: f.title,
    description: `${f.why} ${f.fix}`,
    priority: f.priority,
    category: f.group === "social" ? "Social" : "Website",
  });
  const items = (group: Finding["group"]) => report.fixes.filter((f) => f.group === group).map(draft);
  return {
    website: { score: report.score.website ?? previous?.websiteScore ?? 0, actionItems: items("website") },
    social: { score: report.score.social ?? previous?.socialScore ?? 0, actionItems: items("social") },
    report,
  };
}

type GoogleCheck = WebsiteCheck & { reviewCount: number; avgRating: number };

async function checkGooglePresence(
  b: BusinessInput,
  sessionToken: string | undefined,
  previous: { reviewCount: number; avgRating: number } | undefined
): Promise<GoogleCheck> {
  const actionItems: ActionItemDraft[] = [];
  let score = 0;
  let reviewCount = previous?.reviewCount ?? 0;
  let avgRating = previous?.avgRating ?? 0;

  if (b.googlePlaceId) {
    // Presence is scored on a verified selection, not on whether this live
    // fetch succeeds: a transient Google outage must never tank a score.
    score += 60;

    const details = await getPlaceDetails(b.googlePlaceId, sessionToken);
    if (details) {
      reviewCount = details.userRatingCount ?? reviewCount;
      avgRating = details.rating ?? avgRating;
    }
  } else {
    actionItems.push({
      key: "google.profile",
      title: "Claim your Google Business Profile",
      description:
        "You have no Google Business Profile connected. Use \"Connect your Google Business Profile\" on this page to find and link your listing. This is the single highest-impact fix on this list.",
      priority: "HIGH",
      category: "Google",
    });
  }

  if (b.phoneNumber && b.phoneNumber.trim() !== "") {
    score += 20;
  } else {
    actionItems.push({
      key: "profile.phone",
      title: "Add a phone number customers can call",
      description:
        "No phone number is on file. A visible number (ideally WhatsApp-enabled) turns searches into conversations.",
      priority: "MEDIUM",
      category: "Profile",
    });
  }

  if (b.category && b.category.trim() !== "") score += 10;
  if (b.city && b.city.trim() !== "") score += 10;

  return { score, actionItems, reviewCount, avgRating };
}

export async function scoreBusiness(
  b: BusinessInput,
  placeSessionToken?: string,
  previousGoogleData?: PreviousScores,
  engineDeps?: ScanDeps
): Promise<ScoreResult> {
  const [{ website, social, report }, google] = await Promise.all([
    checkWebsiteAndSocial(b, previousGoogleData, engineDeps),
    checkGooglePresence(b, placeSessionToken, previousGoogleData),
  ]);

  const total = Math.round(0.4 * google.score + 0.4 * website.score + 0.2 * social.score);

  const priorityRank = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
  const actionItems = [...google.actionItems, ...website.actionItems, ...social.actionItems].sort(
    (a, z) => priorityRank[a.priority] - priorityRank[z.priority]
  );

  return {
    total,
    googleScore: google.score,
    socialScore: social.score,
    websiteScore: website.score,
    reviewCount: google.reviewCount,
    avgRating: google.avgRating,
    actionItems,
    report,
  };
}
