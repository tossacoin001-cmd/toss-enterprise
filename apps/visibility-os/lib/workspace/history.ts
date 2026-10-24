import { compareScans } from "@/lib/value/changes";
import type { Finding } from "@/lib/scan/types";

/**
 * The list of past checks, with what changed between each one and the one before. Comparing like with
 * like: only checks that could be made both times count, and an older check that saved no details is
 * "not comparable" rather than a made-up change. Tests: tests/workspace/history.test.ts.
 */

type Stored = { id: string; total: number; recordedAt: Date; findings: unknown };

export type HistoryRow = {
  id: string;
  total: number;
  recordedAt: Date;
  dateText: string;
  coverage: number | null;
  change: number | null;
  changeText: string;
};

function asFindings(value: unknown): Finding[] | null {
  if (!Array.isArray(value)) return null;
  const ok = value.filter((x): x is Finding => !!x && typeof x === "object" && typeof (x as Finding).id === "string" && typeof (x as Finding).state === "string" && typeof (x as Finding).points === "number");
  return ok.length > 0 ? ok : null;
}

export function coverageOf(value: unknown): number | null {
  const findings = asFindings(value);
  if (!findings) return null;
  const all = findings.reduce((n, f) => n + f.points, 0);
  if (all <= 0) return null;
  return Math.round((findings.filter((f) => f.state !== "could_not_check").reduce((n, f) => n + f.points, 0) / all) * 100);
}

export const dateText = (d: Date): string => d.toLocaleDateString("en-GB", { timeZone: "Africa/Lagos", day: "numeric", month: "short", year: "numeric" });

/** Newest first, as the rows arrive. */
export function buildHistory(rows: Stored[]): HistoryRow[] {
  return rows.map((row, i) => {
    const older = rows[i + 1];
    const base = { id: row.id, total: row.total, recordedAt: row.recordedAt, dateText: dateText(row.recordedAt), coverage: coverageOf(row.findings) };
    if (!older) return { ...base, change: null, changeText: "First check" };

    const now = asFindings(row.findings);
    const before = asFindings(older.findings);
    if (!now || !before) return { ...base, change: null, changeText: "Not comparable: an earlier check did not record its details" };

    const delta = compareScans({ findings: before }, { findings: now }).scoreDelta;
    if (delta === null) return { ...base, change: null, changeText: "Not comparable: too few checks could be made both times" };
    if (delta === 0) return { ...base, change: 0, changeText: "No change" };
    return { ...base, change: delta, changeText: delta > 0 ? `Up ${delta} points` : `Down ${Math.abs(delta)} points` };
  });
}
