import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Notice, PageHeader, StatusBadge } from "@/components/ui";
import PrintButton from "@/components/workspace/PrintButton";
import { compareScans } from "@/lib/value/changes";
import { coverageOf, dateText } from "@/lib/workspace/history";
import { describeScore } from "@/lib/workspace/score-state";

type F = { id: string; group: string; state: "found" | "missing" | "could_not_check"; priority: "HIGH" | "MEDIUM" | "LOW"; title: string; why?: string; fix?: string; points: number; earned: number };

function readFindings(value: unknown): F[] | null {
  if (!Array.isArray(value)) return null;
  const ok = value.filter((x): x is F => !!x && typeof x === "object" && typeof (x as F).id === "string" && typeof (x as F).title === "string" && typeof (x as F).state === "string");
  return ok.length ? ok : null;
}

/** One saved check, readable on screen and when printed. Only the signed-in owner can open it. */
export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const { id } = await params;

  const score = await db.visibilityScore
    .findFirst({ where: { id, business: { userId } }, include: { business: { select: { name: true, category: true, city: true, googlePlaceId: true } } } })
    .catch(() => null);
  if (!score) notFound();

  const previous = await db.visibilityScore
    .findFirst({ where: { businessId: score.businessId, recordedAt: { lt: score.recordedAt } }, orderBy: { recordedAt: "desc" } })
    .catch(() => null);

  const findings = readFindings(score.findings);
  const before = readFindings(previous?.findings);
  const changes = findings && before ? compareScans({ findings: before }, { findings }) : null;
  // A report describes the check as it was, so its age is measured at the moment it was made.
  const view = describeScore(score, { hasGoogle: Boolean(score.business.googlePlaceId) }, score.recordedAt.getTime());
  const coverage = coverageOf(score.findings);

  const missing = findings?.filter((f) => f.state === "missing") ?? [];
  const found = findings?.filter((f) => f.state === "found") ?? [];
  const unchecked = findings?.filter((f) => f.state === "could_not_check") ?? [];

  return (
    <div className="ws-stack" style={{ maxWidth: 800, margin: "0 auto" }}>
      <PageHeader
        title={`${score.business.name}: report for ${dateText(score.recordedAt)}`}
        description={[score.business.category, score.business.city].filter(Boolean).join(" · ") || undefined}
        actions={<PrintButton />}
      />
      <p className="ws-small ws-no-print"><Link className="ws-link" href={`/reports`}>Back to all reports</Link></p>

      <section className="ws-card" aria-labelledby="r-score">
        <h2 id="r-score" className="ws-h2">Readiness score</h2>
        <p className="ws-num" style={{ fontSize: "2.6rem", fontWeight: 700, lineHeight: 1, marginTop: "0.5rem" }}>{score.total} <span className="ws-muted" style={{ fontSize: "1rem", fontWeight: 500 }}>out of 100</span></p>
        <p className="ws-small ws-muted" style={{ marginTop: "0.4rem" }}>
          {coverage === null ? "This older check did not record which parts could be checked." : `${coverage}% of the check points could be checked. Anything we could not check is not counted.`}
        </p>
        <p className="ws-small ws-muted" style={{ marginTop: "0.4rem" }}>
          Website: {view.parts.website.kind === "score" ? `${view.parts.website.value} out of 100` : "could not be checked"}. Social: {view.parts.social.kind === "score" ? `${view.parts.social.value} out of 100` : "could not be checked"}. Google: {view.parts.google.kind === "score" ? `${view.parts.google.value} out of 100` : "not connected"}.
        </p>
      </section>

      {changes && (changes.alerts.length > 0 || changes.good.length > 0 || changes.notes.length > 0) && (
        <section className="ws-card" aria-labelledby="r-changes">
          <h2 id="r-changes" className="ws-h2">What changed since the check before</h2>
          <ul className="ws-stack" style={{ marginTop: "0.6rem", paddingLeft: "1.2rem" }}>
            {[...changes.alerts, ...changes.good, ...changes.notes].map((c) => (<li key={`${c.kind}-${c.id}`}>{c.text}</li>))}
          </ul>
        </section>
      )}

      {!findings ? (
        <Notice tone="info">This check was made before we saved the detail of each finding, so only the scores are shown.</Notice>
      ) : (
        <>
          <section className="ws-card" aria-labelledby="r-missing">
            <h2 id="r-missing" className="ws-h2">Needs attention ({missing.length})</h2>
            {missing.length === 0 ? <p className="ws-muted" style={{ marginTop: "0.5rem" }}>Nothing was missing.</p> : (
              <ul className="ws-stack" style={{ listStyle: "none", padding: 0, marginTop: "0.6rem" }}>
                {missing.map((f) => (
                  <li key={f.id}>
                    <p className="ws-h3">{f.title} <StatusBadge tone={f.priority === "HIGH" ? "danger" : f.priority === "MEDIUM" ? "warn" : "neutral"}>{f.priority === "HIGH" ? "High priority" : f.priority === "MEDIUM" ? "Medium priority" : "Low priority"}</StatusBadge></p>
                    {f.why && <p className="ws-muted ws-small">{f.why}</p>}
                    {f.fix && <p className="ws-small"><strong>What to do:</strong> {f.fix}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="ws-card" aria-labelledby="r-found">
            <h2 id="r-found" className="ws-h2">Working ({found.length})</h2>
            <ul style={{ paddingLeft: "1.2rem", marginTop: "0.6rem" }}>{found.map((f) => (<li key={f.id}>{f.title}</li>))}</ul>
          </section>
          {unchecked.length > 0 && (
            <section className="ws-card" aria-labelledby="r-unchecked">
              <h2 id="r-unchecked" className="ws-h2">Could not be checked ({unchecked.length})</h2>
              <p className="ws-muted ws-small" style={{ marginTop: "0.4rem" }}>These are not counted in the score.</p>
              <ul style={{ paddingLeft: "1.2rem", marginTop: "0.6rem" }}>{unchecked.map((f) => (<li key={f.id}>{f.title}</li>))}</ul>
            </section>
          )}
        </>
      )}

      <p className="ws-small ws-muted">
        Not measured yet: how you show up when people search, your Google reviews unless your listing is connected, and whether AI assistants mention you. A good score means the basics are in place. It does not promise more customers.
      </p>
    </div>
  );
}
