import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import PlanCards from "@/components/plans/PlanCards";
import { getAccess } from "@/lib/billing/access";
import { checkoutAvailable, isPlanId, type PlanId } from "@/lib/billing/plans";
import { db } from "@/lib/db";

export default async function PlansPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const access = await getAccess(userId).catch(() => null);
  const sub = access?.paid ? await db.subscription.findUnique({ where: { userId } }).catch(() => null) : null;
  const current: PlanId | null = sub && isPlanId(sub.plan) ? sub.plan : null;

  return (
    <div className="ws-stack" style={{ maxWidth: 1000, margin: "0 auto" }}>
      <PageHeader title="Plans" description={access ? `${access.label}. ${access.detail}` : "Choose how you want to use Visibility OS."} />
      <PlanCards mode="app" checkoutOpen={checkoutAvailable({ secretKey: process.env.PAYSTACK_SECRET_KEY })} currentPlan={current} />
    </div>
  );
}
