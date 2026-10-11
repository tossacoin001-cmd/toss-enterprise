import "server-only";
import type { VisibilityScore } from "@prisma/client";
import { db } from "./db";
import { scoreBusiness, type BusinessInput, type ActionItemDraft } from "./scoring";

/** A business with its most recent score first (caller orders desc, takes 1). */
export type BusinessForScoring = BusinessInput & {
  id: string;
  visibilityScores: VisibilityScore[];
};

export type RunScoreResult = {
  score: VisibilityScore;
  previous: VisibilityScore | undefined;
  actionItems: ActionItemDraft[];
};

/** Scores a business and persists the result. Shared by the on-demand score
 * route and the weekly cron so there is one scoring-and-persisting path. */
export async function runAndPersistScore(
  business: BusinessForScoring,
  placeSessionToken?: string
): Promise<RunScoreResult> {
  const previous = business.visibilityScores[0];
  const result = await scoreBusiness(
    business,
    placeSessionToken,
    previous
      ? { reviewCount: previous.reviewCount, avgRating: previous.avgRating, websiteScore: previous.websiteScore, socialScore: previous.socialScore }
      : undefined
  );

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

  return { score, previous, actionItems: result.actionItems };
}
