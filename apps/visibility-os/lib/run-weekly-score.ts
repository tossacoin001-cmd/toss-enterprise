import "server-only";
import type { Prisma, VisibilityScore } from "@prisma/client";
import { db } from "./db";
import { scoreBusiness, type BusinessInput, type ActionItemDraft } from "./scoring";
import { compareScans, slimFindings, type ChangeSet } from "./value/changes";
import type { Finding } from "./scan";

/** A business with its most recent score first (caller orders desc, takes 1). */
export type BusinessForScoring = BusinessInput & {
  id: string;
  visibilityScores: VisibilityScore[];
};

export type RunScoreResult = {
  score: VisibilityScore;
  previous: VisibilityScore | undefined;
  actionItems: ActionItemDraft[];
  /** What changed since last time; null on a business's first run, when there is nothing to compare. */
  changes: ChangeSet | null;
};

export type RunScoreOptions = {
  /** Look once more before reporting a break, so one bad moment never causes a scare. On by default. */
  recheck?: boolean;
  recheckDelayMs?: number;
};

const DEFAULT_RECHECK_DELAY_MS = 8_000;
const sleep = (ms: number) => (ms > 0 ? new Promise<void>((r) => setTimeout(r, ms)) : Promise.resolve());

/** Scores a business and persists the result. Shared by the on-demand score
 * route and the weekly cron so there is one scoring-and-persisting path. */
export async function runAndPersistScore(
  business: BusinessForScoring,
  placeSessionToken?: string,
  options: RunScoreOptions = {}
): Promise<RunScoreResult> {
  const previous = business.visibilityScores[0];
  const prior = previous
    ? { reviewCount: previous.reviewCount, avgRating: previous.avgRating, websiteScore: previous.websiteScore, socialScore: previous.socialScore }
    : undefined;
  const lastFindings = Array.isArray(previous?.findings) ? (previous!.findings as unknown as Finding[]) : null;

  let result = await scoreBusiness(business, placeSessionToken, prior);
  let changes = lastFindings ? compareScans({ findings: lastFindings }, result.report) : null;

  // A break is looked at twice before anyone is told. The second look decides.
  if (changes?.alerts.some((a) => a.recheckFirst) && options.recheck !== false) {
    await sleep(options.recheckDelayMs ?? DEFAULT_RECHECK_DELAY_MS);
    result = await scoreBusiness(business, placeSessionToken, prior);
    changes = compareScans({ findings: lastFindings! }, result.report);
  }

  const [score] = await db.$transaction([
    db.visibilityScore.create({
      data: {
        businessId: business.id,
        total: result.total,
        googleScore: result.googleScore,
        socialScore: result.socialScore,
        websiteScore: result.websiteScore,
        reviewCount: result.reviewCount,
        avgRating: result.avgRating,
        findings: slimFindings(result.report.findings) as unknown as Prisma.InputJsonValue,
      },
    }),
    // Regenerate open recommendations; in-progress and done items are kept.
    db.actionItem.deleteMany({ where: { businessId: business.id, status: "PENDING" } }),
    db.actionItem.createMany({
      data: result.actionItems.map((item) => ({
        businessId: business.id,
        title: item.title,
        description: item.description,
        priority: item.priority,
        category: item.category,
      })),
    }),
  ]);

  return { score, previous, actionItems: result.actionItems, changes };
}
