import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

const PLAN_DETAILS = {
  FREE: {
    name: "Free",
    price: "$0/mo",
    features: ["1 business", "Basic visibility tracking", "Manual audits"],
    nextPlan: "Starter",
  },
  STARTER: {
    name: "Starter",
    price: "$29/mo",
    features: ["1 business", "Auto monthly reports", "AI action items", "Email support"],
    nextPlan: "Growth",
  },
  GROWTH: {
    name: "Growth",
    price: "$79/mo",
    features: ["3 businesses", "AI audits", "Weekly reports", "Priority support"],
    nextPlan: "Agency",
  },
  AGENCY: {
    name: "Agency",
    price: "$199/mo",
    features: ["Unlimited businesses", "White-label reports", "API access", "Dedicated support"],
    nextPlan: null,
  },
};

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();

  type PlanKey = keyof typeof PLAN_DETAILS;
  let dbUser: { plan: PlanKey } | null = null;
  try {
    const u = await db.user.findUnique({ where: { id: userId } });
    if (u) dbUser = { plan: u.plan as PlanKey };
  } catch { /* DB not configured */ }

  const plan: PlanKey = dbUser?.plan ?? "FREE";
  const planDetails = PLAN_DETAILS[plan];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="font-display text-3xl font-light mb-1" style={{ color: "#FAF7F2" }}>
          Settings
        </h2>
        <p className="text-xs" style={{ color: "rgba(250,247,242,0.4)" }}>
          Manage your account and subscription
        </p>
      </div>

      {/* Account */}
      <div
        className="p-5"
        style={{ background: "rgba(9,45,34,0.3)", border: "1px solid rgba(201,169,110,0.1)" }}
      >
        <div className="flex items-center gap-3 mb-4" style={{ borderBottom: "1px solid rgba(201,169,110,0.07)", paddingBottom: "1rem" }}>
          <div className="section-line" />
          <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#C9A96E" }}>
            Account
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-[10px] mb-1" style={{ color: "rgba(250,247,242,0.4)" }}>Name</div>
            <div className="text-sm" style={{ color: "#FAF7F2" }}>
              {clerkUser?.firstName} {clerkUser?.lastName}
            </div>
          </div>
          <div>
            <div className="text-[10px] mb-1" style={{ color: "rgba(250,247,242,0.4)" }}>Email</div>
            <div className="text-sm" style={{ color: "#FAF7F2" }}>
              {clerkUser?.emailAddresses[0]?.emailAddress}
            </div>
          </div>
          <div>
            <div className="text-[10px] mb-1" style={{ color: "rgba(250,247,242,0.4)" }}>Account ID</div>
            <div className="text-xs font-mono" style={{ color: "rgba(250,247,242,0.3)" }}>
              {userId.substring(0, 20)}…
            </div>
          </div>
        </div>
      </div>

      {/* Plan */}
      <div
        className="p-5"
        style={{ background: "rgba(9,45,34,0.3)", border: "1px solid rgba(201,169,110,0.1)" }}
      >
        <div className="flex items-center gap-3 mb-4" style={{ borderBottom: "1px solid rgba(201,169,110,0.07)", paddingBottom: "1rem" }}>
          <div className="section-line" />
          <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#C9A96E" }}>
            Subscription
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display text-2xl font-light" style={{ color: "#FAF7F2" }}>
                {planDetails.name}
              </span>
              <span className="badge badge-gold">{planDetails.price}</span>
            </div>
            <ul className="space-y-1 mt-3">
              {planDetails.features.map((f: string) => (
                <li key={f} className="flex items-center gap-2 text-xs" style={{ color: "rgba(250,247,242,0.5)" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {planDetails.nextPlan && (
            <div
              className="p-4 min-w-[180px]"
              style={{ background: "rgba(201,169,110,0.05)", border: "1px solid rgba(201,169,110,0.15)" }}
            >
              <div className="text-xs mb-2" style={{ color: "rgba(250,247,242,0.5)" }}>
                Upgrade to {planDetails.nextPlan}
              </div>
              <Link
                href="https://toss-enterprise.com/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold block text-center py-2 text-[10px] tracking-[0.15em] uppercase"
              >
                Upgrade →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Data */}
      <div
        className="p-5"
        style={{ background: "rgba(9,45,34,0.2)", border: "1px solid rgba(201,169,110,0.07)" }}
      >
        <div className="flex items-center gap-3 mb-4" style={{ borderBottom: "1px solid rgba(201,169,110,0.07)", paddingBottom: "1rem" }}>
          <div className="section-line" />
          <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#C9A96E" }}>
            Data & Privacy
          </span>
        </div>
        <p className="text-xs mb-4" style={{ color: "rgba(250,247,242,0.4)" }}>
          Your data is stored securely and never sold to third parties.
        </p>
        <button
          className="text-xs"
          style={{ color: "rgba(239,68,68,0.6)" }}
        >
          Request data deletion →
        </button>
      </div>
    </div>
  );
}
