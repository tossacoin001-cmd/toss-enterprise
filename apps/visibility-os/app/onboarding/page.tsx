import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import OnboardingForm from "@/components/OnboardingForm";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // If user already has 3 businesses, redirect to dashboard
  try {
    const count = await db.business.count({ where: { userId } });
    if (count >= 3) redirect("/businesses");
  } catch {
    // DB not configured — allow through
  }

  return (
    <div
      className="min-h-screen px-6 py-16"
      style={{ background: "linear-gradient(180deg, #092D22 0%, #050E09 60%)" }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="section-line" />
            <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>
              Setup
            </span>
          </div>
          <p className="text-xs mb-1" style={{ color: "rgba(250,247,242,0.4)" }}>
            Step 1 of 1 — Connect Your Business
          </p>
        </div>

        <OnboardingForm />
      </div>
    </div>
  );
}
