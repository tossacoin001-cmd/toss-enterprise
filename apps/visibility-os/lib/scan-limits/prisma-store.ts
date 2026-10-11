import "server-only";
import type { Prisma, PrismaClient, Scan } from "@prisma/client";
import type { ScanReport } from "@/lib/scan";
import type { ScanRecord, ScanStore } from "./store";

const UNCLAIMED_KEEP_MS = 30 * 24 * 3600 * 1000;

const toRecord = (r: Scan): ScanRecord => ({
  id: r.id,
  siteKey: r.siteKey,
  url: r.url,
  visitorHash: r.visitorHash,
  status: r.status === "done" || r.status === "incomplete" ? r.status : "running",
  result: (r.result as unknown as ScanReport | null) ?? null,
  createdAt: r.createdAt.getTime(),
  expiresAt: r.expiresAt.getTime(),
});

/** The database version of ScanStore. Rules are the same as the in-memory one in tests/scan-limits/harness.ts. */
export function prismaStore(db: PrismaClient): ScanStore {
  return {
    async findFresh(siteKey, since) {
      const r = await db.scan.findFirst({ where: { siteKey, createdAt: { gt: new Date(since) } }, orderBy: { createdAt: "desc" } });
      return r ? toRecord(r) : null;
    },
    countSince: (since) => db.scan.count({ where: { createdAt: { gte: new Date(since) } } }),
    countByVisitor: (visitorHash, since) => db.scan.count({ where: { visitorHash, createdAt: { gte: new Date(since) } } }),
    async createOrJoin(input) {
      // One transaction per site, serialised by a lock on the site, so two people scanning the
      // same new site at the same moment cause one scan.
      return db.$transaction(async (tx) => {
        if (input.siteKey) {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${input.siteKey}))`;
          const hit = await tx.scan.findFirst({ where: { siteKey: input.siteKey, createdAt: { gt: new Date(input.freshSince) } }, orderBy: { createdAt: "desc" } });
          if (hit) return { scan: toRecord(hit), created: false };
        }
        const row = await tx.scan.create({
          data: { id: input.id, siteKey: input.siteKey, url: input.url, visitorHash: input.visitorHash, status: "running", createdAt: new Date(input.now), expiresAt: new Date(input.now + UNCLAIMED_KEEP_MS) },
        });
        return { scan: toRecord(row), created: true };
      });
    },
    async get(id) {
      const r = await db.scan.findUnique({ where: { id } });
      return r ? toRecord(r) : null;
    },
    async finish(id, status, result) {
      await db.scan.update({ where: { id }, data: { status, result: result === null ? undefined : (result as unknown as Prisma.InputJsonValue) } });
    },
  };
}
