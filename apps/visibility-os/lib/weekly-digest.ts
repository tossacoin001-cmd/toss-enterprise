import "server-only";
import type { VisibilityScore } from "@prisma/client";
import type { ActionItemDraft } from "./scoring";
import type { ChangeSet } from "./value/changes";

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
  /** What changed since last week. Missing on a first run. */
  changes?: ChangeSet | null;
};

/** The lines about what changed, most important first: breaks, then good news, then what we could not check. */
function describeChanges(entry: DigestEntry): string[] {
  const c = entry.changes;
  if (!c) return [];
  const lines: string[] = [];
  if (c.alerts.length) lines.push(`Needs your attention at ${entry.name}:`, ...c.alerts.map((a) => `- ${a.text}`));
  if (c.good.length) lines.push(`Good news at ${entry.name}:`, ...c.good.map((g) => `- ${g.text}`));
  if (c.notes.length) lines.push(`For your information:`, ...c.notes.map((n) => `- ${n.text}`));
  return lines;
}

function describeBusiness(entry: DigestEntry): string {
  const { name, total, delta, topActionItem } = entry;
  const moved = delta.scoreDelta !== 0 || delta.reviewDelta !== 0 || delta.ratingDelta !== 0;

  if (moved) {
    const parts: string[] = [];
    const sign = delta.scoreDelta > 0 ? "+" : "";
    parts.push(`readiness score ${total - delta.scoreDelta} -> ${total} (${sign}${delta.scoreDelta})`);
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
    return `${name}: holding steady at ${total}/100 readiness. Biggest opportunity: ${topActionItem.title} - ${topActionItem.description}`;
  }

  return `${name}: holding steady at ${total}/100 readiness. Nothing left on your action list, nice work.`;
}

export type DigestLinks = {
  dashboardUrl: string;
  /** null when no signing secret is configured; the footer line is then omitted. */
  unsubscribeUrl: string | null;
};

export function buildDigestEmail(
  entries: DigestEntry[],
  links?: DigestLinks
): { subject: string; text: string } {
  const needsAttention = entries.some((e) => e.changes?.alerts.length);
  const subject = needsAttention
    ? entries.length === 1
      ? `Something needs your attention: ${entries[0].name}`
      : "Something needs your attention on your Visibility OS check-in"
    : entries.length === 1
      ? `Your weekly Visibility OS check-in: ${entries[0].name}`
      : "Your weekly Visibility OS check-in";

  const changeLines = entries.flatMap(describeChanges);

  const text = [
    entries.length === 1
      ? "Here is where your business stands this week."
      : "Here is where your businesses stand this week.",
    "",
    ...(changeLines.length ? [...changeLines, ""] : []),
    ...entries.map(describeBusiness),
    "",
    links
      ? `See the full breakdown and your action list: ${links.dashboardUrl}`
      : "See the full breakdown and your action list in your dashboard.",
    ...(links?.unsubscribeUrl
      ? ["", "---", `Do not want this weekly email? Unsubscribe: ${links.unsubscribeUrl}`]
      : []),
  ].join("\n");

  return { subject, text };
}
