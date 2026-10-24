-- AlterTable
ALTER TABLE "ActionItem" ADD COLUMN "key" TEXT,
ADD COLUMN "note" TEXT,
ADD COLUMN "completedAt" TIMESTAMP(3),
ADD COLUMN "lastSeenFailingAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "ActionItem_businessId_key_key" ON "ActionItem"("businessId", "key");
