/**
 * Business creation under the account limit. Count and create share one serializable transaction so two
 * quick requests cannot both pass the check. One retry on a serialization clash (Prisma P2034).
 */

type Tx = {
  business: {
    count(args: { where: { userId: string } }): Promise<number>;
    create(args: { data: Record<string, unknown> }): Promise<Record<string, unknown>>;
  };
};

export interface LimitDb {
  $transaction<T>(fn: (tx: Tx) => Promise<T>, options: { isolationLevel: "Serializable" }): Promise<T>;
}

export type LimitResult = { ok: true; business: Record<string, unknown> } | { ok: false };

const clash = (e: unknown): boolean => typeof e === "object" && e !== null && (e as { code?: string }).code === "P2034";

export async function createWithinLimit(db: LimitDb, userId: string, fields: Record<string, unknown>, limit: number): Promise<LimitResult> {
  const attempt = (): Promise<LimitResult> =>
    db.$transaction(
      async (tx): Promise<LimitResult> => {
        if ((await tx.business.count({ where: { userId } })) >= limit) return { ok: false };
        return { ok: true, business: await tx.business.create({ data: { ...fields, userId } }) };
      },
      { isolationLevel: "Serializable" },
    );
  try {
    return await attempt();
  } catch (e) {
    if (!clash(e)) throw e;
    return attempt();
  }
}
