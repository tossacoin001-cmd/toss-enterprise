import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { appUrl } from "./app-url";

/** The weekly email's unsubscribe link carries an HMAC of the user id, so a
 * link cannot be forged for someone else. Keyed on CRON_SECRET, which this
 * app already requires; rotating it invalidates old links, which is fine. */
function sign(userId: string): string | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(`unsubscribe:${userId}`).digest("hex").slice(0, 32);
}

export function unsubscribeUrl(userId: string): string | null {
  const token = sign(userId);
  if (!token) return null;
  return `${appUrl()}/api/unsubscribe?u=${encodeURIComponent(userId)}&t=${token}`;
}

export function isValidUnsubscribeToken(userId: string, token: string): boolean {
  const expected = sign(userId);
  if (!expected || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
