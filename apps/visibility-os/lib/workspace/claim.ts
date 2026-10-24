/**
 * A free check made before signing up becomes the owner's. Claiming is decided by the database in one
 * conditional step, so it is safe to repeat, safe when two people try at once, and bound to the signed-in
 * user. Tests: tests/workspace/claim.test.ts.
 */

export type ScanRow = {
  id: string;
  siteKey: string | null;
  url: string | null;
  status: string;
  claimedByUserId: string | null;
  expiresAt: Date;
  result: unknown;
};

export interface ScanDb {
  scan: {
    findUnique(args: { where: { id: string } }): Promise<ScanRow | null>;
    updateMany(args: {
      where: { id: string; OR: Array<{ claimedByUserId: string | null }> };
      data: { claimedByUserId: string; expiresAt: Date };
    }): Promise<{ count: number }>;
  };
}

export type ClaimResult = { status: "claimed" | "already_yours" | "taken" | "not_found" | "not_ready" | "invalid" };

const SCAN_ID = /^[0-9a-f]{32,64}$/;
const KEEP_FOR_MS = 10 * 365 * 86_400_000; // a claimed result is kept until the owner deletes it

export async function claimScan(db: ScanDb, scanId: string, userId: string, now: number): Promise<ClaimResult> {
  if (!SCAN_ID.test(scanId)) return { status: "invalid" };
  const row = await db.scan.findUnique({ where: { id: scanId } });
  if (!row || row.expiresAt.getTime() < now) return { status: "not_found" };
  if (row.status !== "done") return { status: "not_ready" };
  if (row.claimedByUserId === userId) return { status: "already_yours" };
  if (row.claimedByUserId !== null) return { status: "taken" };

  // Only changes the row if it is still unclaimed (or already this user's): the database decides, not us.
  const changed = await db.scan.updateMany({
    where: { id: scanId, OR: [{ claimedByUserId: null }, { claimedByUserId: userId }] },
    data: { claimedByUserId: userId, expiresAt: new Date(now + KEEP_FOR_MS) },
  });
  return { status: changed.count === 1 ? "claimed" : "taken" };
}

export type OnboardingPrefill = {
  scanId: string;
  name?: string;
  city?: string;
  category?: string;
  website?: string;
  instagramHandle?: string;
};

const text = (v: unknown, max: number): string | undefined => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);

/** What the onboarding form starts with, taken from a free check the signed-in user may use. Only the form's own fields. */
export function prefillFromScan(row: ScanRow | null, userId: string, now: number): OnboardingPrefill | null {
  if (!row || row.expiresAt.getTime() < now || row.status !== "done") return null;
  if (row.claimedByUserId !== null && row.claimedByUserId !== userId) return null;

  const out: OnboardingPrefill = { scanId: row.id };
  const result = row.result && typeof row.result === "object" ? (row.result as { meta?: Record<string, unknown> }) : null;
  const meta = result?.meta && typeof result.meta === "object" ? result.meta : null;

  const name = text(meta?.name, 120);
  const city = text(meta?.city, 80);
  const category = text(meta?.category, 80);
  const website = text(row.url, 300);
  const handles = meta?.handles && typeof meta.handles === "object" ? (meta.handles as Record<string, unknown>) : null;
  const instagram = text(typeof handles?.instagram === "string" ? handles.instagram.replace(/^@/, "") : undefined, 60);

  if (name) out.name = name;
  if (city) out.city = city;
  if (category) out.category = category;
  if (website) out.website = website;
  if (instagram) out.instagramHandle = instagram;
  return out;
}
