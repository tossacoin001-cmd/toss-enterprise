/** Removes free checks nobody saved, once their 30 days are up. Saved (claimed) checks are never touched. */
export interface CleanupDb {
  scan: { deleteMany(args: { where: { expiresAt: { lt: Date }; claimedByUserId: null } }): Promise<{ count: number }> };
}

export async function cleanupExpiredScans(db: CleanupDb, now: number): Promise<number> {
  const r = await db.scan.deleteMany({ where: { expiresAt: { lt: new Date(now) }, claimedByUserId: null } });
  return r.count;
}
