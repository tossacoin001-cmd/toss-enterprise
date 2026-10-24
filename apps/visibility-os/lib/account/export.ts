/** Everything we hold about one account, as plain data the owner can download. Own rows only. */
type Row = Record<string, unknown>;

export interface ExportDb {
  user: { findUnique(args: { where: { id: string }; select: Record<string, true> }): Promise<Row | null> };
  business: {
    findMany(args: { where: { userId: string }; include: Record<string, unknown> }): Promise<Array<Row & { actionItems: Row[]; visibilityScores: Row[] }>>;
  };
  scan: { findMany(args: { where: { claimedByUserId: string }; select: Record<string, true> }): Promise<Row[]> };
  subscription: { findUnique(args: { where: { userId: string } }): Promise<Row | null> };
}

export async function buildExport(db: ExportDb, userId: string, now: number) {
  const [account, businesses, checks, subscription] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, plan: true, trialStartedAt: true, trialEndsAt: true, digestOptOut: true, createdAt: true } }),
    db.business.findMany({ where: { userId }, include: { visibilityScores: { orderBy: { recordedAt: "asc" } }, actionItems: true } }),
    db.scan.findMany({ where: { claimedByUserId: userId }, select: { id: true, url: true, createdAt: true, result: true } }),
    db.subscription.findUnique({ where: { userId } }),
  ]);
  return { exportedAt: new Date(now).toISOString(), account, subscription, businesses, checks };
}
