import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import DashboardClient from "./DashboardClient";

async function getUserData(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        businesses: {
          orderBy: { createdAt: "desc" },
          include: {
            visibilityScores: {
              orderBy: { recordedAt: "desc" },
              take: 1,
            },
            actionItems: {
              where: { status: { not: "DONE" } },
              orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
              take: 5,
            },
          },
        },
      },
    });
    return user;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getUserData(userId);

  const hasBusiness = user && user.businesses.length > 0;
  const primaryBusiness = hasBusiness ? user.businesses[0] : null;
  const latestScore = primaryBusiness?.visibilityScores[0] ?? null;
  const actionItems = primaryBusiness?.actionItems ?? [];

  if (!hasBusiness || !primaryBusiness) {
    return (
      <div className="max-w-3xl mx-auto">
        {/* Empty state */}
        <div className="mb-8">
          <h2
            className="font-display text-3xl font-light mb-2"
            style={{ color: "#FAF7F2" }}
          >
            Welcome to Visibility OS.
          </h2>
          <p className="text-sm" style={{ color: "rgba(250,247,242,0.5)" }}>
            Connect your first business to start tracking your digital visibility.
          </p>
        </div>

        <div
          className="p-8 text-center"
          style={{
            background: "linear-gradient(135deg, #0D3F2E, #092D22)",
            border: "1px solid rgba(201,169,110,0.2)",
          }}
        >
          <div
            className="w-14 h-14 mx-auto mb-6 flex items-center justify-center"
            style={{ border: "1px solid rgba(201,169,110,0.25)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h3
            className="font-display text-2xl font-light mb-3"
            style={{ color: "#FAF7F2" }}
          >
            Connect Your First Business
          </h3>
          <p
            className="text-sm leading-relaxed max-w-sm mx-auto mb-8"
            style={{ color: "rgba(250,247,242,0.5)" }}
          >
            Add your business details and we'll start building your visibility profile — Google, social, website, and more.
          </p>
          <Link
            href="/onboarding"
            className="btn-gold inline-block px-10 py-3.5 text-xs tracking-[0.2em] uppercase"
          >
            Get Started →
          </Link>
        </div>

        {/* What's coming */}
        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          {[
            { label: "Visibility Score", desc: "A single score that tracks your overall digital presence." },
            { label: "Action Items", desc: "AI-generated tasks ranked by impact to grow your visibility." },
            { label: "Monthly Reports", desc: "Clear reports showing progress and what to focus on next." },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4"
              style={{ background: "rgba(9,45,34,0.2)", border: "1px solid rgba(201,169,110,0.07)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-3" style={{ background: "#C9A96E" }} />
                <div className="text-xs font-medium" style={{ color: "#FAF7F2" }}>{item.label}</div>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: "rgba(250,247,242,0.4)" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DashboardClient
      business={primaryBusiness}
      score={latestScore}
      actionItems={actionItems}
      allBusinesses={user.businesses}
    />
  );
}
