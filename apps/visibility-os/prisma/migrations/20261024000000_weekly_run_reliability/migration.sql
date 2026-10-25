-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "weeklyClaimAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "WeeklyRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "usersProcessed" INTEGER NOT NULL DEFAULT 0,
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "skippedNoEmail" INTEGER NOT NULL DEFAULT 0,
    "skippedOptedOut" INTEGER NOT NULL DEFAULT 0,
    "skippedClaimed" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "budgetExhausted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WeeklyRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WeeklyRun_startedAt_idx" ON "WeeklyRun"("startedAt");
