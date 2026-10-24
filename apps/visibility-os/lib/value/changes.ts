import type { Evidence, Finding, Priority } from "@/lib/scan/types";

/**
 * The weekly watch: what changed since last time, in plain words. It must be right in both directions:
 * never miss a real break, and never cry wolf over one bad moment. So:
 *  - a check that was fine and is now certainly missing is an alert (to be double-checked before anyone is told);
 *  - a check we merely could not make this time is a quiet note, and the last result is kept;
 *  - the score change is worked out only from checks that could be made both times.
 * Tests: tests/value/changes.test.ts.
 */

export type Change = {
  id: string;
  kind: "got_worse" | "got_better" | "coming_up" | "could_not_check_now";
  text: string;
  priority: Priority;
  /** Run the check once more before telling anyone, so one bad moment never causes a scare. */
  recheckFirst?: boolean;
};

export type ChangeSet = { alerts: Change[]; good: Change[]; notes: Change[]; scoreDelta: number | null };

const RANK: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
const byImportance = (a: Change, b: Change) => RANK[a.priority] - RANK[b.priority] || a.id.localeCompare(b.id);
const sentence = (s: string) => (/[.!?]$/.test(s) ? s : `${s}.`);

/** What a comparison needs from a finding, so a saved (slimmed) one works as well as a fresh one. */
export type Comparable = Pick<Finding, "id" | "state" | "title" | "points" | "earned" | "priority">;

export function compareScans(prev: { findings: Comparable[] }, next: { findings: Comparable[] }): ChangeSet {
  const before = new Map(prev.findings.map((f) => [f.id, f]));
  const alerts: Change[] = [];
  const good: Change[] = [];
  const notes: Change[] = [];
  let prevEarned = 0;
  let nextEarned = 0;
  let possible = 0;

  for (const now of next.findings) {
    const was = before.get(now.id);
    const settled = (e: Evidence | undefined) => e === "found" || e === "missing";

    // The score only compares checks that could be made both times.
    if (was && settled(was.state) && settled(now.state)) {
      prevEarned += was.earned;
      nextEarned += now.earned;
      possible += now.points;
    }

    if (now.id === "site.cert_expiring") {
      // A certificate that is about to end is a heads-up, and only news the first time.
      if (now.state === "missing" && was?.state !== "missing") {
        alerts.push({ id: now.id, kind: "coming_up", priority: now.priority, text: sentence(`Heads up: ${now.title}`) });
      }
      continue;
    }
    if (!was) continue;

    if (was.state === "found" && now.state === "missing") {
      alerts.push({ id: now.id, kind: "got_worse", priority: now.priority, recheckFirst: true, text: sentence(`Something changed: ${now.title}`) });
    } else if (was.state === "found" && now.state === "could_not_check") {
      notes.push({ id: now.id, kind: "could_not_check_now", priority: now.priority, text: sentence(`${now.title} this time. We kept your last result`) });
    } else if (was.state === "missing" && now.state === "found") {
      good.push({ id: now.id, kind: "got_better", priority: now.priority, text: sentence(`Fixed: ${now.title}`) });
    }
  }

  alerts.sort(byImportance);
  good.sort(byImportance);
  notes.sort(byImportance);
  const pct = (earned: number) => Math.round((earned / possible) * 100);
  return { alerts, good, notes, scoreDelta: possible > 0 ? pct(nextEarned) - pct(prevEarned) : null };
}

/** Findings are small, so a whole week's result can be kept with the score and compared next time. */
export type StoredFindings = Pick<Finding, "id" | "group" | "state" | "priority" | "title" | "points" | "earned" | "cause" | "caveat" | "detail" | "minutes" | "why" | "fix">[];
export const slimFindings = (findings: Finding[]): StoredFindings => findings.map(({ id, group, state, priority, title, points, earned, cause, caveat, detail, minutes, why, fix }) => ({ id, group, state, priority, title, points, earned, cause, caveat, detail, minutes, why, fix }));
