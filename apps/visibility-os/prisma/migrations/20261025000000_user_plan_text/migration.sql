-- Production's User table came from an earlier version of the product and has no "plan" column, but the app
-- reads it on every user row. Add it as plain text (no database type), so it cannot depend on one.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "plan" TEXT NOT NULL DEFAULT 'FREE';

-- That older table also has a required "subscriptionStatus" with no default, which the app does not know
-- about. Any new account would fail to save. Make it optional only when it is required and has no default.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'subscriptionStatus'
      AND is_nullable = 'NO' AND column_default IS NULL
  ) THEN
    ALTER TABLE "User" ALTER COLUMN "subscriptionStatus" DROP NOT NULL;
  END IF;
END $$;
