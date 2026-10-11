import "server-only";
import { createHash } from "node:crypto";
import { after } from "next/server";
import { db } from "@/lib/db";
import { runScan, type ScanReport } from "@/lib/scan";
import type { Verdict } from "@/lib/scan/social";
import { prismaStore } from "./prisma-store";
import type { ScanDeps2 } from "./service";
import { verifyTurnstile } from "./turnstile";

/** The real dependencies for the scan API: database, Turnstile, a shared social cache, after-response work. */

const socialCache = new Map<string, Verdict>();
const derive = (label: string) => createHash("sha256").update(`${label}:${process.env.TURNSTILE_SECRET_KEY ?? ""}`).digest("hex");

/** Null when the human check is not set up, so the scan fails closed instead of running unprotected. */
export function realDeps(): ScanDeps2 | null {
  if (!process.env.TURNSTILE_SECRET_KEY) return null;
  return {
    store: prismaStore(db),
    verifyHuman: (token, ip) => verifyTurnstile(token, ip),
    runScan: (input): Promise<ScanReport> => runScan(input, { cache: socialCache, budgetMs: 30_000 }),
    schedule: (task) => after(task),
    now: Date.now,
    cookieSecret: derive("scan-cookie"),
    salt: derive("scan-visitor"),
    alert: (what) => console.error(`[scan-alert] ${what}`),
  };
}
