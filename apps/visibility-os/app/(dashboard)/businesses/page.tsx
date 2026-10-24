import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button, EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { BUSINESS_LIMIT } from "@/lib/billing/policy";
import { describeScore } from "@/lib/workspace/score-state";
import { serverNow } from "@/lib/workspace/clock";

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
  const now = serverNow();
  const canAdd = businesses.length < BUSINESS_LIMIT;

  return (
    <div className="ws-stack" style={{ maxWidth: 900, margin: "0 auto" }}>
      <PageHeader
        title="Businesses"
        description={`${businesses.length} of ${BUSINESS_LIMIT} businesses.`}
        actions={canAdd ? <Button href="/onboarding" variant="secondary">Add a business</Button> : undefined}
      />

      {businesses.length === 0 ? (
        <EmptyState title="No businesses yet" action={<Button href="/onboarding">Add your business</Button>}>
          Add your business to get a readiness score and a list of what to do first.
        </EmptyState>
      ) : (
        <ul className="ws-grid" style={{ listStyle: "none", padding: 0, margin: 0, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {businesses.map((biz) => {
            const view = describeScore(biz.visibilityScores[0] ?? null, { hasGoogle: Boolean(biz.googlePlaceId) }, now);
            const open = biz._count.actionItems;
            return (
              <li key={biz.id} className="ws-card ws-stack">
                <div>
                  <h2 className="ws-h2" style={{ overflowWrap: "anywhere" }}>{biz.name}</h2>
                  <p className="ws-muted ws-small">{[biz.category, biz.city].filter(Boolean).join(" · ") || "No details added"}</p>
                </div>
                <div>
                  {view.state === "none" ? (
                    <StatusBadge>Not checked yet</StatusBadge>
                  ) : (
                    <>
                      <p className="ws-num" style={{ fontSize: "1.8rem", fontWeight: 700, lineHeight: 1 }}>
                        {view.total} <span className="ws-muted" style={{ fontSize: "0.9rem", fontWeight: 500 }}>readiness</span>
                      </p>
                      <p className="ws-muted ws-small" style={{ marginTop: 4 }}>{view.checkedText}</p>
                      {view.state === "stale" && <div style={{ marginTop: 6 }}><StatusBadge tone="warn">Out of date</StatusBadge></div>}
                    </>
                  )}
                </div>
                <div className="ws-row" style={{ justifyContent: "space-between" }}>
                  <span className="ws-small ws-muted">{open} open action{open === 1 ? "" : "s"}</span>
                  <Link href={`/businesses/${biz.id}`} className="ws-link">Open</Link>
                  {" "}
                  <Link href={`/businesses/${biz.id}/edit`} className="ws-link">Edit</Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
