"use client";

import { useState } from "react";
import { Button, Notice, StatusBadge } from "@/components/ui";
import { PLANS, PLAN_ORDER, annualNaira, annualSavingsNaira, formatNaira, type Interval, type PlanId } from "@/lib/billing/plans";

/**
 * The three packages. Used inside the app (where a package can be bought) and on the public pricing page
 * (where the way in is the free trial). Prices come only from lib/billing/plans.ts. Tests: tests/billing/plans-render.test.ts.
 */
export default function PlanCards({
  checkoutOpen, mode, currentPlan, initialInterval = "MONTHLY",
}: { checkoutOpen: boolean; mode: "app" | "public"; currentPlan: PlanId | null; initialInterval?: Interval }) {
  const [interval, setInterval] = useState<Interval>(initialInterval);
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(plan: PlanId) {
    setBusy(plan);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ plan, interval }) });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) { setError(data.error ?? "We could not start the payment. Please try again."); setBusy(null); return; }
      window.location.assign(data.url);
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
      setBusy(null);
    }
  }

  return (
    <div className="ws-stack">
      <div className="ws-row" role="group" aria-label="How often you pay" style={{ flexWrap: "wrap" }}>
        <Button variant={interval === "MONTHLY" ? "primary" : "secondary"} size="small" onClick={() => setInterval("MONTHLY")} aria-pressed={interval === "MONTHLY"}>Monthly</Button>
        <Button variant={interval === "ANNUAL" ? "primary" : "secondary"} size="small" onClick={() => setInterval("ANNUAL")} aria-pressed={interval === "ANNUAL"}>Yearly</Button>
        <span className="ws-small ws-muted">Pay for a year and get 2 months free.</span>
      </div>

      {error ? <Notice tone="danger" live="assertive">{error}</Notice> : null}

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
        {PLAN_ORDER.map((id) => {
          const p = PLANS[id];
          const yearly = interval === "ANNUAL";
          const mine = currentPlan === id;
          return (
            <section key={id} className="ws-card ws-stack" aria-labelledby={`plan-${id}`} style={mine ? { borderColor: "var(--ws-accent)" } : undefined}>
              <div>
                <div className="ws-row" style={{ justifyContent: "space-between" }}>
                  <h2 id={`plan-${id}`} className="ws-h2">{p.name}</h2>
                  {mine ? <StatusBadge tone="good">Your package</StatusBadge> : null}
                </div>
                <p className="ws-muted ws-small">{p.tagline}</p>
              </div>

              <div>
                <p style={{ fontSize: "1.7rem", fontWeight: 700, lineHeight: 1.1 }}>
                  {formatNaira(yearly ? annualNaira(id) : p.monthlyNaira)}
                  <span className="ws-muted" style={{ fontSize: "0.9rem", fontWeight: 400 }}>{yearly ? " a year" : " a month"}</span>
                </p>
                {yearly ? (
                  <p className="ws-small ws-muted">That is {formatNaira(Math.round(annualNaira(id) / 12))} a month. You save {formatNaira(annualSavingsNaira(id))}: 2 months free.</p>
                ) : (
                  <p className="ws-small ws-muted">Or {formatNaira(annualNaira(id))} a year: 2 months free.</p>
                )}
              </div>

              <ul className="ws-small" style={{ paddingLeft: "1.1rem", margin: 0, listStyle: "disc", display: "grid", gap: "0.25rem" }}>
                {p.included.map((i) => <li key={i}>{i}</li>)}
              </ul>

              {p.comingSoon.length > 0 ? (
                <div>
                  <p className="ws-small" style={{ fontWeight: 600 }}>Coming soon</p>
                  <ul className="ws-small ws-muted" style={{ paddingLeft: "1.1rem", margin: "0.3rem 0 0", listStyle: "disc", display: "grid", gap: "0.35rem" }}>
                    {p.comingSoon.map((i) => <li key={i}>{i} <StatusBadge tone="gold">Coming soon</StatusBadge></li>)}
                  </ul>
                  <p className="ws-small ws-muted" style={{ marginTop: "0.3rem" }}>Yours the day it opens, at no extra cost.</p>
                </div>
              ) : null}

              <div style={{ marginTop: "auto", paddingTop: "0.6rem" }}>
                {mode === "public" ? (
                  <Button href={`/sign-up?redirect_url=${encodeURIComponent("/plans")}`} variant={id === "STARTER" ? "primary" : "secondary"}>Start free trial</Button>
                ) : checkoutOpen ? (
                  <Button variant={id === "STARTER" ? "primary" : "secondary"} disabled={busy !== null || mine} onClick={() => choose(id)}>
                    {busy === id ? "Opening payment" : mine ? "Your package" : `Choose ${p.name}`}
                  </Button>
                ) : (
                  <Button variant="secondary" disabled>Payments open soon</Button>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <p className="ws-small ws-muted">
        {mode === "public"
          ? "Every account starts with a 7-day free trial. No card is needed."
          : checkoutOpen
            ? "You pay once for the period you choose. We do not charge you again on our own."
            : "Payments are not open yet. Your free trial and your data are not affected, and we will tell you before anything changes."}
      </p>
    </div>
  );
}
