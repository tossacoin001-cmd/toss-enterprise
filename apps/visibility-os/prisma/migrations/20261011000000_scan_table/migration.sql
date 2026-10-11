-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL,
    "siteKey" TEXT,
    "url" TEXT,
    "visitorHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "claimedByUserId" TEXT,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Scan_siteKey_createdAt_idx" ON "Scan"("siteKey", "createdAt");

-- CreateIndex
CREATE INDEX "Scan_visitorHash_createdAt_idx" ON "Scan"("visitorHash", "createdAt");

-- CreateIndex
CREATE INDEX "Scan_createdAt_idx" ON "Scan"("createdAt");

-- CreateIndex
CREATE INDEX "Scan_expiresAt_idx" ON "Scan"("expiresAt");
