/** Deleting an account needs the exact phrase. Our data goes first (businesses, scores and actions follow the user), then the sign-in. */
export const DELETE_PHRASE = "delete my account";

export interface DeleteDb {
  scan: { deleteMany(args: { where: { claimedByUserId: string } }): Promise<unknown> };
  user: { deleteMany(args: { where: { id: string } }): Promise<unknown> };
}

export type DeleteResult = { ok: true; signInKept?: true } | { ok: false; reason: "confirm" };

export async function deleteAccount(db: DeleteDb, userId: string, confirm: unknown, removeSignIn: () => Promise<void>): Promise<DeleteResult> {
  if (typeof confirm !== "string" || confirm.trim().toLowerCase() !== DELETE_PHRASE) return { ok: false, reason: "confirm" };
  await db.scan.deleteMany({ where: { claimedByUserId: userId } });
  await db.user.deleteMany({ where: { id: userId } });
  try {
    await removeSignIn();
  } catch {
    return { ok: true, signInKept: true };
  }
  return { ok: true };
}
