import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import OnboardingForm from "@/components/OnboardingForm";
import { PageHeader } from "@/components/ui";
import { BUSINESS_LIMIT } from "@/lib/billing/policy";
import { isPlacesConfigured } from "@/lib/google-places";
import { prefillFromScan, type ScanRow } from "@/lib/workspace/claim";
import { serverNow } from "@/lib/workspace/clock";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ scan?: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Over the business limit already: go to the list, which says why. (redirect throws, so it must be outside the try.)
  let count = 0;
  try {
    count = await db.business.count({ where: { userId } });
  } catch {
    // DB not configured: allow through
  }
  if (count >= BUSINESS_LIMIT) redirect("/businesses");

  // A free check made before signing up fills the form. Only one this user may use: never someone else's.
  const { scan: scanId } = await searchParams;
  let initial = {};
  if (scanId && /^[0-9a-f]{32,64}$/.test(scanId)) {
    const row = (await db.scan.findUnique({ where: { id: scanId } }).catch(() => null)) as ScanRow | null;
    initial = prefillFromScan(row, userId, serverNow()) ?? {};
  }

  return (
    <div className="ws-root min-h-screen px-4 py-10">
      <div className="ws-stack" style={{ maxWidth: 560, margin: "0 auto" }}>
        <PageHeader title="Add your business" description="About two minutes. Only the name is needed." />
        <OnboardingForm googleEnabled={isPlacesConfigured()} initial={initial} />
      </div>
    </div>
  );
}
