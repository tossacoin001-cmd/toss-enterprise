import { NextResponse } from "next/server";
import { sendEmail } from "@toss/email";
import { db } from "@/lib/db";
import { runAndPersistScore } from "@/lib/run-weekly-score";
import { isDeliverableEmail } from "@/lib/utils";
import { computeDelta, buildDigestEmail, type DigestEntry } from "@/lib/weekly-digest";

// GET routes can otherwise be statically optimized by Next.js; this must
// run fresh on every Vercel Cron invocation, never cached.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BATCH_SIZE = 3;

async function runInBatches<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size);
    results.push(...(await Promise.all(batch.map(fn))));
  }
  return results;
}

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

  const businesses = await db.business.findMany({
    include: {
      user: true,
      visibilityScores: { orderBy: { recordedAt: "desc" }, take: 1 },
    },
  });

  type ScoredBusiness = {
    userId: string;
    userEmail: string;
    entry: DigestEntry;
  };

  const outcomes = await runInBatches(businesses, BATCH_SIZE, async (business): Promise<ScoredBusiness | null> => {
    try {
      const { score, previous, actionItems } = await runAndPersistScore(business);
      return {
        userId: business.userId,
        userEmail: business.user.email,
        entry: {
          name: business.name,
          total: score.total,
          delta: computeDelta(previous, score),
          topActionItem: actionItems[0] ?? null,
        },
      };
    } catch (e) {
      console.error(`[cron/weekly-score] failed to score business ${business.id}`, e);
      return null;
    }
  });

  const byUser = new Map<string, { email: string; entries: DigestEntry[] }>();
  let errors = 0;
  for (const outcome of outcomes) {
    if (!outcome) {
      errors += 1;
      continue;
    }
    const existing = byUser.get(outcome.userId);
    if (existing) {
      existing.entries.push(outcome.entry);
    } else {
      byUser.set(outcome.userId, { email: outcome.userEmail, entries: [outcome.entry] });
    }
  }

  let emailsSent = 0;
  let skippedNoEmail = 0;
  for (const { email, entries } of byUser.values()) {
    if (!isDeliverableEmail(email)) {
      skippedNoEmail += 1;
      continue;
    }
    const { subject, text } = buildDigestEmail(entries);
    const result = await sendEmail({ to: email, subject, text });
    if (result.ok) {
      emailsSent += 1;
    } else {
      errors += 1;
      console.error(`[cron/weekly-score] email send failed for a user`, result.error);
    }
  }

  return NextResponse.json({
    businessesScored: outcomes.filter(Boolean).length,
    emailsSent,
    skippedNoEmail,
    errors,
  });
}
