"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConnectGoogleCard from "@/components/ConnectGoogleCard";
import { Button, Notice, PageHeader, StatusBadge } from "@/components/ui";
import ActionPlan, { sortActions, type ActionRow } from "@/components/workspace/ActionPlan";
import { describeScore, type Part, type ScoreRow } from "@/lib/workspace/score-state";

type Business = {
  id: string;
  name: string;
  category: string | null;
  city: string | null;
  googlePlaceId?: string | null;
};

interface DashboardClientProps {
  business: Business;
  /** The latest saved check, or null when none has been run. A stored 0 is a real 0. */
  score: ScoreRow | null;
  actions: ActionRow[];
  allBusinesses: Business[];
  /** Whether the server has a Google Places key (see isPlacesConfigured). */
  googleEnabled?: boolean;
  /** Server time in milliseconds, so what the page says about age is the same on server and browser. */
  now: number;
}

function partText(p: Part): string {
  if (p.kind === "score") return `${p.value} out of 100`;
  if (p.kind === "not_connected") return "Not connected";
  return "Could not be checked";
}

export default function DashboardClient({ business, score, actions, allBusinesses, googleEnabled = false, now }: DashboardClientProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const view = describeScore(score, { hasGoogle: Boolean(business.googlePlaceId) }, now);

  async function runCheck() {
    setChecking(true);
    setError("");
    try {
      const res = await fetch(`/api/businesses/${business.id}/score`, { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "The check did not finish. Please try again.");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "The check did not finish. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  const todo = actions.filter((a) => a.status === "PENDING").length;
  const inProgress = actions.filter((a) => a.status === "IN_PROGRESS").length;
  const done = actions.filter((a) => a.status === "DONE").length;
  const open = sortActions(actions.filter((a) => a.status !== "DONE"));
  const meta = [business.category, business.city].filter(Boolean).join(" · ");

  return (
    <div className="ws-stack" style={{ maxWidth: 1000, margin: "0 auto" }}>
      <PageHeader
        title={business.name}
        description={meta || undefined}
        actions={
          allBusinesses.length > 1 ? (
            <div>
              <label className="ws-label" htmlFor="business-picker">Business</label>
              <select id="business-picker" className="ws-select" value={business.id} onChange={(e) => router.push(`/businesses/${e.target.value}`)}>
                {allBusinesses.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
              </select>
            </div>
          ) : undefined
        }
      />

      {error && <Notice tone="danger" live="assertive">{error}</Notice>}

      <div className="ws-grid ws-grid--2">
        <section className="ws-card" aria-labelledby="readiness-title">
          <h2 id="readiness-title" className="ws-h2">Readiness score</h2>

          {view.state === "none" ? (
            <div className="ws-stack" style={{ marginTop: "0.6rem" }}>
              <p style={{ fontSize: "1.5rem", fontWeight: 650 }}>Not checked yet</p>
              <p className="ws-muted">Run your first check to see how ready you are to be found, and what to do first.</p>
              <Button disabled={checking} onClick={runCheck}>{checking ? "Checking..." : "Run first check"}</Button>
            </div>
          ) : (
            <div className="ws-stack" style={{ marginTop: "0.6rem" }}>
              <p className="ws-num" style={{ fontSize: "2.8rem", lineHeight: 1, fontWeight: 700 }}>
                {view.total} <span className="ws-muted" style={{ fontSize: "1rem", fontWeight: 500 }}>out of 100</span>
              </p>
              <p className="ws-muted ws-small">{view.checkedText}</p>

              {view.state === "stale" && (
                <Notice tone="warn" title="This check is out of date">Your last check is older than a week. Check again to see where you stand now.</Notice>
              )}
              {view.state === "partial" && view.coverage !== null && (
                <Notice tone="info" title={`We checked ${view.coverage}% of the points`}>
                  We could not check some parts of your site this time, so they are not counted in your score.
                </Notice>
              )}

              <ul className="ws-stack ws-small" style={{ listStyle: "none", padding: 0, margin: "0.9rem 0 0" }}>
                <li className="ws-row" style={{ justifyContent: "space-between" }}><span>Website</span><span className="ws-num">{partText(view.parts.website)}</span></li>
                <li className="ws-row" style={{ justifyContent: "space-between" }}><span>Social</span><span className="ws-num">{partText(view.parts.social)}</span></li>
                <li className="ws-row" style={{ justifyContent: "space-between" }}><span>Google</span><span className="ws-num">{partText(view.parts.google)}</span></li>
                <li className="ws-row" style={{ justifyContent: "space-between" }}>
                  <span>Reviews</span>
                  <span className="ws-num">
                    {view.parts.reviews.kind === "count"
                      ? `${view.parts.reviews.count} reviews${view.parts.reviews.rating ? `, ${view.parts.reviews.rating.toFixed(1)} stars` : ""}`
                      : "Not connected"}
                  </span>
                </li>
              </ul>

              <div className="ws-row">
                <Button variant="secondary" disabled={checking || !view.canRecheck} onClick={runCheck}>{checking ? "Checking..." : "Check again"}</Button>
                {view.recheckHint && <p className="ws-muted ws-small">{view.recheckHint}</p>}
              </div>
            </div>
          )}
        </section>

        <section className="ws-card ws-card--quiet" aria-labelledby="progress-title">
          <h2 id="progress-title" className="ws-h2">Your progress</h2>
          <p style={{ marginTop: "0.6rem" }}>
            <span className="ws-num">{todo} to do, {inProgress} in progress, {done} done</span>
          </p>
          <div className="ws-meter" style={{ marginTop: "0.6rem" }} aria-hidden="true">
            <span style={{ width: `${actions.length ? Math.round((done / actions.length) * 100) : 0}%` }} />
          </div>
          <p className="ws-muted ws-small" style={{ marginTop: "0.6rem" }}>
            Finishing actions does not promise more customers. It makes sure the basics are in place for people who look for you.
          </p>
        </section>
      </div>

      {!business.googlePlaceId && <ConnectGoogleCard businessId={business.id} enabled={googleEnabled} />}

      <section aria-labelledby="next-actions" className="ws-stack">
        <div className="ws-row" style={{ justifyContent: "space-between" }}>
          <h2 id="next-actions" className="ws-h2">Your next three actions</h2>
          {open.length > 3 && <Link className="ws-link ws-small" href={`/actions?business=${business.id}`}>See the full action plan ({open.length} open)</Link>}
          {open.length <= 3 && actions.length > 0 && <Link className="ws-link ws-small" href={`/actions?business=${business.id}`}>See the full action plan</Link>}
        </div>
        {view.state === "none" && actions.length === 0 ? (
          <Notice>Your actions appear here after your first check.</Notice>
        ) : (
          <ActionPlan businessId={business.id} items={actions} now={now} filter="open" limit={3} />
        )}
      </section>

      <section className="ws-card ws-card--quiet" aria-labelledby="not-measured-title">
        <h2 id="not-measured-title" className="ws-h3">Not measured yet</h2>
        <p className="ws-muted ws-small" style={{ marginTop: "0.3rem" }}>
          This score is about the basics. It does not tell you how you show up in search, what your reviews say, or whether AI assistants mention you.
        </p>
        <div style={{ marginTop: "0.5rem" }}><StatusBadge tone="gold">Reviews and Google need a connection</StatusBadge></div>
      </section>
    </div>
  );
}
