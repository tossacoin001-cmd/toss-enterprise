import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  if (score >= 20) return "Poor";
  return "Critical";
}

export function scoreColor(score: number): string {
  if (score >= 80) return "#4ade80";
  if (score >= 60) return "#C9A96E";
  if (score >= 40) return "#f59e0b";
  if (score >= 20) return "#f97316";
  return "#ef4444";
}

/** User.email is @unique, so a user created before we know their real address
 * gets a per-user placeholder on this domain, never a shared "". The weekly
 * digest skips these; scripts/backfill-user-emails.ts replaces them. */
export const PENDING_EMAIL_DOMAIN = "pending.toss-enterprise.local";

export function pendingEmail(userId: string): string {
  return `${userId}@${PENDING_EMAIL_DOMAIN}`;
}

export function isDeliverableEmail(email: string): boolean {
  return email !== "" && !email.endsWith(`@${PENDING_EMAIL_DOMAIN}`);
}
