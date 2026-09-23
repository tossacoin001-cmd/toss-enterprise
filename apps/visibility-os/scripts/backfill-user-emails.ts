/**
 * One-time fix for users who signed up before CLERK_WEBHOOK_SECRET was
 * configured in production: the lazy user-upsert in
 * app/api/businesses/route.ts left their `email` column blank. Run once,
 * after the webhook is wired up, via `pnpm backfill-emails` (loads
 * .env.local via Node's --env-file flag, see package.json). Not part of
 * any ongoing code path.
 */
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "../lib/db";

async function main() {
  const blankUsers = await db.user.findMany({ where: { email: "" } });
  if (blankUsers.length === 0) {
    console.log("No users with a blank email. Nothing to backfill.");
    return;
  }

  console.log(`Backfilling ${blankUsers.length} user(s)...`);
  const clerk = await clerkClient();

  let fixed = 0;
  let stillMissing = 0;
  for (const user of blankUsers) {
    try {
      const clerkUser = await clerk.users.getUser(user.id);
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
      const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

      if (!email) {
        stillMissing += 1;
        console.warn(`  ${user.id}: Clerk has no email on file either, skipped`);
        continue;
      }

      await db.user.update({ where: { id: user.id }, data: { email, name } });
      fixed += 1;
    } catch (e) {
      stillMissing += 1;
      console.error(`  ${user.id}: lookup failed`, e);
    }
  }

  console.log(`Done. Fixed ${fixed}, still missing ${stillMissing}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
