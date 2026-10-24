import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deleteAccount, type DeleteDb } from "@/lib/account/delete";

export const dynamic = "force-dynamic";

/** Deletes the signed-in account and everything under it. Needs { "confirm": "delete my account" }. */
export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const body: unknown = await req.json().catch(() => null);
  const confirm = body && typeof body === "object" ? (body as { confirm?: unknown }).confirm : undefined;
  try {
    const result = await deleteAccount(db as unknown as DeleteDb, userId, confirm, async () => {
      const client = await clerkClient();
      await client.users.deleteUser(userId);
    });
    if (!result.ok) return NextResponse.json({ error: "Type the words \"delete my account\" to confirm." }, { status: 400 });
    return NextResponse.json({ deleted: true, signInKept: result.signInKept === true });
  } catch (e) {
    console.error("[DELETE /api/account]", e instanceof Error ? e.message : "failed");
    return NextResponse.json({ error: "Something went wrong on our side. Please try again." }, { status: 500 });
  }
}
