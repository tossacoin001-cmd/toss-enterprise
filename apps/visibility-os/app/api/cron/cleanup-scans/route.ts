import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cleanupExpiredScans, type CleanupDb } from "@/lib/account/cleanup";

export const dynamic = "force-dynamic";

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Daily: deletes free checks nobody saved once their 30 days are up (the privacy notice's promise). */
export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const deleted = await cleanupExpiredScans(db as unknown as CleanupDb, Date.now());
  return NextResponse.json({ deleted });
}
