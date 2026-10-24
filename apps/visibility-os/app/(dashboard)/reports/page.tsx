import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button, EmptyState, Notice, PageHeader } from "@/components/ui";
import { buildHistory } from "@/lib/workspace/history";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ business?: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const { business: businessId } = await searchParams;

  const businesses = await db.business.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: { id: true, name: true } }).catch(() => []);
  if (businesses.length === 0) {
    return (
      <div className="ws-stack" style={{ maxWidth: 720, margin: "0 auto" }}>
        <PageHeader title="Reports" />
        <EmptyState title="No reports yet" action={<Button href="/onboarding">Add your business</Button>}>
          Each check you run is saved here, so you can see what changed.
        </EmptyState>
      </div>
    );
  }

  const current = businesses.find((b) => b.id === businessId) ?? businesses[0];
  const scores = await db.visibilityScore
    .findMany({ where: { businessId: current.id }, orderBy: { recordedAt: "desc" }, take: 52 })
    .catch(() => []);
  const history = buildHistory(scores.map((s) => ({ id: s.id, total: s.total, recordedAt: s.recordedAt, findings: s.findings })));

  return (
    <div className="ws-stack" style={{ maxWidth: 800, margin: "0 auto" }}>
      <PageHeader title="Reports" description={`Every check for ${current.name}, newest first.`} actions={history.length > 0 ? <Button href={`/reports/${history[0].id}`} variant="secondary" className="ws-no-print">Open the latest report</Button> : undefined} />

      {businesses.length > 1 && (
        <nav aria-label="Business" className="ws-row">
          {businesses.map((b) => (
            <Link key={b.id} href={`/reports?business=${b.id}`} className={`ws-btn ws-btn--small ${b.id === current.id ? "" : "ws-btn--secondary"}`} aria-current={b.id === current.id ? "true" : undefined}>
              {b.name}
            </Link>
          ))}
        </nav>
      )}

      {history.length === 0 ? (
        <EmptyState title="No checks yet">Run a check from your overview and it will be saved here.</EmptyState>
      ) : (
        <>
          <Notice tone="info">
            A change in score only compares the checks that could be made both times, so a check we could not make never counts as a drop.
          </Notice>
          <div style={{ overflowX: "auto" }}>
            <table className="ws-card" style={{ width: "100%", borderCollapse: "collapse", padding: 0 }}>
              <caption className="ws-small ws-muted" style={{ textAlign: "left", padding: "0.5rem 0.8rem" }}>Checks for {current.name}</caption>
              <thead>
                <tr>
                  {["Date", "Readiness score", "Checked", "Change since the one before", ""].map((h) => (
                    <th key={h} scope="col" className="ws-small" style={{ textAlign: "left", padding: "0.6rem 0.8rem", borderBottom: "1px solid var(--ws-line)" }}>{h || <span className="ws-no-print">Report</span>}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td style={{ padding: "0.6rem 0.8rem", borderBottom: "1px solid var(--ws-line)" }}>{h.dateText}</td>
                    <td className="ws-num" style={{ padding: "0.6rem 0.8rem", borderBottom: "1px solid var(--ws-line)" }}>{h.total}</td>
                    <td className="ws-num" style={{ padding: "0.6rem 0.8rem", borderBottom: "1px solid var(--ws-line)" }}>{h.coverage === null ? "Not recorded" : `${h.coverage}%`}</td>
                    <td style={{ padding: "0.6rem 0.8rem", borderBottom: "1px solid var(--ws-line)" }}>{h.changeText}</td>
                    <td style={{ padding: "0.6rem 0.8rem", borderBottom: "1px solid var(--ws-line)" }} className="ws-no-print"><Link className="ws-link" href={`/reports/${h.id}`}>Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
