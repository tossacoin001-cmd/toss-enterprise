-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "trialStartedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP(3);

-- The column may already exist from outside the migration history. Make sure it never blocks a new account.
ALTER TABLE "User" ALTER COLUMN "trialEndsAt" DROP NOT NULL;
