import type { ScanReport } from "@/lib/scan";

/** One stored scan. Times are milliseconds. Holds no network address and no raw visitor identity. */
export type ScanRecord = {
  id: string;
  siteKey: string | null;
  url: string | null;
  visitorHash: string;
  status: "running" | "done" | "incomplete";
  result: ScanReport | null;
  createdAt: number;
  expiresAt: number;
};

export type NewScan = { id: string; siteKey: string | null; url: string | null; visitorHash: string; now: number; freshSince: number };

/** What the limits and the cache need from a database. The Prisma version is in prisma-store.ts. */
export interface ScanStore {
  /** A scan of this site newer than `since`, running or done. */
  findFresh(siteKey: string, since: number): Promise<ScanRecord | null>;
  /** How many scans were started since this moment (the whole service). */
  countSince(since: number): Promise<number>;
  countByVisitor(visitorHash: string, since: number): Promise<number>;
  /** Creates the scan, unless another request just made a fresh one for the same site; then returns that one. */
  createOrJoin(input: NewScan): Promise<{ scan: ScanRecord; created: boolean }>;
  get(id: string): Promise<ScanRecord | null>;
  finish(id: string, status: "done" | "incomplete", result: ScanReport | null): Promise<void>;
}
