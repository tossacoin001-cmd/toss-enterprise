import "server-only";
import type { Prisma } from "@prisma/client";
import { sendEmail } from "@toss/email";
import { db } from "./db";
import { appUrl } from "./app-url";
import { isDeliverableEmail } from "./utils";
import { unsubscribeUrl } from "./unsubscribe";
import { runAndPersistScore } from "./run-weekly-score";
import { buildDigestEmail, computeDelta, type DigestEntry } from "./weekly-digest";
import { WEEKLY_INTERVAL_MS, type RunDeps, type UserOutcome } from "./weekly-run";

export type DueUser = Prisma.UserGetPayload<{
  include: { businesses: { include: { visibilityScores: true } } };
}>;

export function dbRunDeps(): RunDeps<DueUser> {
  return {
    now: () => Date.now(),

    async findDueUsers(limit, excludeIds) {
      const cutoff = new Date(Date.now() - WEEKLY_INTERVAL_MS);
      return db.user.findMany({
        where: {
          businesses: { some: {} },
          id: { notIn: excludeIds },
          // Never-run users wait until they are 6+ days old, so the first
          // email arrives at the end of the trial rather than the day after.
          OR: [
            { lastDigestAt: null, createdAt: { lt: cutoff } },
            { lastDigestAt: { lt: cutoff } },
          ],
        },
        orderBy: [{ lastDigestAt: { sort: "asc", nulls: "first" } }, { createdAt: "asc" }],
        take: limit,
        include: {
          businesses: {
            orderBy: { createdAt: "asc" },
            include: { visibilityScores: { orderBy: { recordedAt: "desc" }, take: 1 } },
          },
        },
      });
    },

    async processUser(user): Promise<UserOutcome> {
      const results = await Promise.allSettled(
        user.businesses.map(async (business): Promise<DigestEntry> => {
          const { score, previous, actionItems } = await runAndPersistScore(business);
          return {
            name: business.name,
            total: score.total,
            delta: computeDelta(previous, score),
            topActionItem: actionItems[0] ?? null,
          };
        })
      );

      const entries: DigestEntry[] = [];
      for (const r of results) {
        if (r.status === "fulfilled") entries.push(r.value);
        else console.error("[weekly] business scoring failed", user.id, r.reason);
      }
      // Nothing scored: leave the user due so tomorrow's run retries.
      if (entries.length === 0) return "failed";

      const markDone = () =>
        db.user.update({ where: { id: user.id }, data: { lastDigestAt: new Date() } });

      if (user.digestOptOut) {
        await markDone();
        return "skipped_opted_out";
      }
      if (!isDeliverableEmail(user.email)) {
        await markDone();
        return "skipped_no_email";
      }

      const unsub = unsubscribeUrl(user.id);
      const { subject, text } = buildDigestEmail(entries, {
        dashboardUrl: `${appUrl()}/dashboard`,
        unsubscribeUrl: unsub,
      });
      const result = await sendEmail({
        to: user.email,
        subject,
        text,
        from: process.env.EMAIL_FROM?.trim() || undefined,
        headers: unsub
          ? { "List-Unsubscribe": `<${unsub}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" }
          : undefined,
      });
      if (!result.ok) {
        // Stays due: a failed send (e.g. sender domain not verified yet) is
        // retried tomorrow instead of silently losing the week's email.
        console.error("[weekly] email send failed", user.id, result.error);
        return "failed";
      }
      await markDone();
      return "sent";
    },
  };
}
