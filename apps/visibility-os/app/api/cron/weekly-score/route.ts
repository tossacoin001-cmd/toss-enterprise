import { NextResponse } from "next/server";
import { dbRunDeps } from "@/lib/weekly-process";
import { db } from "@/lib/db";
import { finishRun, startRun, type RunRecordDb } from "@/lib/weekly-claim";
import { runWeekly } from "@/lib/weekly-run";

// GET routes can otherwise be statically optimized by Next.js; this must
// run fresh on every Vercel Cron invocation, never cached.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Vercel's documented cron-auth convention: set CRON_SECRET, and Vercel
// sends it back as this header when it invokes the schedule.
function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const record = db as unknown as RunRecordDb;
  const runId = await startRun(record, Date.now());
  const summary = await runWeekly(dbRunDeps());
  await finishRun(record, runId, Date.now(), summary);
  return NextResponse.json(summary);
}
