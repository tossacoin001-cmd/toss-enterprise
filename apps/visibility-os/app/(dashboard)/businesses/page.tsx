import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { scoreColor, formatScore } from "@/lib/utils";

async function fetchBusinesses(userId: string) {
  return db.business.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      visibilityScores: { orderBy: { recordedAt: "desc" }, take: 1 },
      _count: { select: { actionItems: { where: { status: { not: "DONE" } } } } },
    },
  });
}

type Business = Awaited<ReturnType<typeof fetchBusinesses>>[number];

async function getBusinesses(userId: string): Promise<Business[]> {
  try {
    return await fetchBusinesses(userId);
  } catch {
    return [];
  }
}

export default async function BusinessesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const businesses = await getBusinesses(userId);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl font-light" style={{ color: "#FAF7F2" }}>
            My Businesses
          </h2>
          <p className="text-xs mt-1" style={{ color: "rgba(250,247,242,0.4)" }}>
            {businesses.length} / 3 businesses on your plan
          </p>
        </div>
        {businesses.length < 3 && (
          <Link
            href="/onboarding"
            className="btn-gold px-6 py-2.5 text-xs tracking-[0.15em] uppercase"
          >
            + Add Business
          </Link>
        )}
      </div>

      {businesses.length === 0 ? (
        <div
          className="p-12 text-center"
          style={{ background: "rgba(9,45,34,0.2)", border: "1px solid rgba(201,169,110,0.1)" }}
        >
          <div
            className="w-12 h-12 mx-auto mb-5 flex items-center justify-center"
            style={{ border: "1px solid rgba(201,169,110,0.2)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <p className="text-sm mb-5" style={{ color: "rgba(250,247,242,0.5)" }}>
            No businesses connected yet.
          </p>
          <Link
            href="/onboarding"
            className="btn-gold inline-block px-8 py-3 text-xs tracking-[0.2em] uppercase"
          >
            Connect Your First Business →
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {businesses.map((biz: Business) => {
            const score = biz.visibilityScores[0]?.total ?? 0;
            const openItems = biz._count.actionItems;
            const hasScore = biz.visibilityScores.length > 0;

            return (
              <div
                key={biz.id}
                className="p-5 flex flex-col gap-4"
                style={{
                  background: "rgba(9,45,34,0.3)",
                  border: "1px solid rgba(201,169,110,0.1)",
                }}
              >
                {/* Business header */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 flex items-center justify-center shrink-0"
                    style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.15)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate" style={{ color: "#FAF7F2" }}>
                      {biz.name}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: "rgba(250,247,242,0.4)" }}>
                      {[biz.category, biz.city].filter(Boolean).join(" · ") || "Business"}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-4">
                  <div>
                    <div
                      className="font-display text-3xl font-light"
                      style={{ color: hasScore ? scoreColor(score) : "rgba(250,247,242,0.2)" }}
                    >
                      {hasScore ? score : "—"}
                    </div>
                    <div className="text-[10px]" style={{ color: "rgba(250,247,242,0.4)" }}>
                      {hasScore ? formatScore(score) : "Not audited"}
                    </div>
                  </div>
                  {hasScore && (
                    <div className="flex-1">
                      <div className="h-1.5 rounded-full" style={{ background: "rgba(201,169,110,0.08)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${score}%`, background: scoreColor(score) }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div
                  className="flex items-center justify-between pt-2"
                  style={{ borderTop: "1px solid rgba(201,169,110,0.07)" }}
                >
                  <span className="text-[10px]" style={{ color: "rgba(250,247,242,0.35)" }}>
                    {openItems} open task{openItems !== 1 ? "s" : ""}
                  </span>
                  <button
                    className="text-[10px] tracking-wide uppercase"
                    style={{ color: "#C9A96E" }}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add business card */}
          {businesses.length < 3 && (
            <Link
              href="/onboarding"
              className="p-5 flex flex-col items-center justify-center gap-3 border border-dashed"
              style={{ borderColor: "rgba(201,169,110,0.15)", minHeight: "160px" }}
            >
              <div
                className="w-8 h-8 flex items-center justify-center"
                style={{ border: "1px solid rgba(201,169,110,0.2)" }}
              >
                <span className="text-lg" style={{ color: "#C9A96E" }}>+</span>
              </div>
              <span className="text-xs tracking-wider" style={{ color: "rgba(250,247,242,0.35)" }}>
                Add another business
              </span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
