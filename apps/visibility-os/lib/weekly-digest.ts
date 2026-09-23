import "server-only";
import type { VisibilityScore } from "@prisma/client";
import type { ActionItemDraft } from "./scoring";

export type ScoreDelta = {
  scoreDelta: number;
  reviewDelta: number;
  ratingDelta: number;
};

/** 0s when there is no previous score yet (a business's first cron run). */
export function computeDelta(
  previous: VisibilityScore | undefined,
  current: VisibilityScore
): ScoreDelta {
  if (!previous) return { scoreDelta: 0, reviewDelta: 0, ratingDelta: 0 };
  return {
    scoreDelta: current.total - previous.total,
    reviewDelta: current.reviewCount - previous.reviewCount,
    ratingDelta: Math.round((current.avgRating - previous.avgRating) * 10) / 10,
  };
}

export type DigestEntry = {
  name: string;
  total: number;
  delta: ScoreDelta;
  topActionItem: ActionItemDraft | null;
};

function describeBusiness(entry: DigestEntry): string {
  const { name, total, delta, topActionItem } = entry;
  const moved = delta.scoreDelta !== 0 || delta.reviewDelta !== 0 || delta.ratingDelta !== 0;

  if (moved) {
    const parts: string[] = [];
    const sign = delta.scoreDelta > 0 ? "+" : "";
    parts.push(`visibility score ${total - delta.scoreDelta} -> ${total} (${sign}${delta.scoreDelta})`);
    if (delta.reviewDelta > 0) {
      parts.push(`${delta.reviewDelta} new Google review${delta.reviewDelta === 1 ? "" : "s"}`);
    }
    if (delta.ratingDelta !== 0) {
      const ratingSign = delta.ratingDelta > 0 ? "+" : "";
      parts.push(`rating moved ${ratingSign}${delta.ratingDelta}`);
    }
    return `${name}: ${parts.join(", ")}.`;
  }

  if (topActionItem) {
    return `${name}: holding steady at ${total}/100. Biggest opportunity: ${topActionItem.title} - ${topActionItem.description}`;
  }

  return `${name}: holding steady at ${total}/100. Nothing left on your action list, nice work.`;
}

export function buildDigestEmail(entries: DigestEntry[]): { subject: string; text: string } {
  const subject =
    entries.length === 1
      ? `Your weekly Visibility OS check-in: ${entries[0].name}`
      : "Your weekly Visibility OS check-in";

  const text = [
    entries.length === 1
      ? "Here is where your business stands this week."
      : "Here is where your businesses stand this week.",
    "",
    ...entries.map(describeBusiness),
    "",
    "See the full breakdown and your action list in your dashboard.",
  ].join("\n");

  return { subject, text };
}
