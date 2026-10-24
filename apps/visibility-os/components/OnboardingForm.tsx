"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Notice } from "@/components/ui";
import GooglePlaceSearch, { type SelectedPlace } from "./GooglePlaceSearch";

const CATEGORIES = [
  "Restaurant / Food & Beverage",
  "Salon & Beauty",
  "Spa & Wellness",
  "Clinic / Healthcare",
  "Real Estate",
  "Retail Store",
  "Event Planning",
  "Education / Training",
  "Fashion & Clothing",
  "Technology",
  "Consulting",
  "Creator or personal brand",
  "Other",
];

const STEPS = ["Your business", "Where people find you", "Google listing"];

export type OnboardingInitial = {
  name?: string;
  category?: string;
  city?: string;
  website?: string;
  instagramHandle?: string;
  /** A free check made before signing up. Its details fill the form, and it is saved to this account when the business is. */
  scanId?: string;
};

/**
 * Adds a business in three short steps. Only a name is needed. Everything else says why we ask and can
 * be left blank. The first check runs before the dashboard opens, capped so a slow site never traps the owner here.
 */
export default function OnboardingForm({ googleEnabled = true, initial = {} }: { googleEnabled?: boolean; initial?: OnboardingInitial }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: initial.name ?? "",
    category: initial.category ?? "",
    city: initial.city ?? "",
    country: "NG",
    phoneNumber: "",
    website: initial.website ?? "",
    instagramHandle: initial.instagramHandle ?? "",
  });
  const [place, setPlace] = useState<SelectedPlace | null>(null);

  const update = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError("");
  };

  const nameOk = form.name.trim().length >= 2;

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, googlePlaceId: place?.placeId ?? null, scanId: initial.scanId }),
      });
      const data = (await res.json().catch(() => ({}))) as { business?: { id: string }; error?: string };
      if (!res.ok) throw new Error(data.error ?? "We could not save your business. Please try again.");

      // Run the first check before landing on the dashboard, so the owner arrives to a real result.
      // Capped so a slow website can never trap them here. The place search's session token rides
      // along so this call closes out the same Google session as the typing above.
      if (data.business?.id) {
        await Promise.race([
          fetch(`/api/businesses/${data.business.id}/score`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ placeSessionToken: place?.sessionToken }),
          }).catch(() => null),
          new Promise((resolve) => setTimeout(resolve, 15000)),
        ]);
      }
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not save your business. Please try again.");
      setSubmitting(false);
    }
  }

  if (submitting) {
    return (
      <div className="ws-card" role="status" aria-live="polite" style={{ textAlign: "center", padding: "2rem 1rem" }}>
        <p className="ws-h2">Checking {form.name || "your business"}</p>
        <p className="ws-muted" style={{ marginTop: "0.4rem" }}>This usually takes under a minute. Your first result opens as soon as it is ready.</p>
      </div>
    );
  }

  return (
    <form className="ws-card ws-stack" onSubmit={(e) => { e.preventDefault(); if (step < STEPS.length) { if (step === 1 && !nameOk) return; setStep(step + 1); } else void submit(); }} noValidate>
      <div>
        <p className="ws-small ws-muted">Step {step} of {STEPS.length}</p>
        <h2 className="ws-h2">{STEPS[step - 1]}</h2>
        <div className="ws-meter" style={{ marginTop: "0.5rem" }} aria-hidden="true"><span style={{ width: `${(step / STEPS.length) * 100}%` }} /></div>
      </div>

      {initial.scanId && step === 1 && <Notice tone="info">We filled in what you told us on the free check. Change anything that is wrong.</Notice>}

      {step === 1 && (
        <div className="ws-stack">
          <div>
            <label className="ws-label" htmlFor="ob-name">Business name</label>
            <input id="ob-name" className="ws-input" value={form.name} onChange={(e) => update("name", e.target.value)} maxLength={120} autoComplete="organization" aria-describedby="ob-name-hint" required />
            <p id="ob-name-hint" className="ws-hint">The name customers know you by. This is the only thing we need.</p>
          </div>
          <div>
            <label className="ws-label" htmlFor="ob-category">What you do <span className="ws-muted">(optional)</span></label>
            <select id="ob-category" className="ws-select" value={form.category} onChange={(e) => update("category", e.target.value)}>
              <option value="">Choose one</option>
              {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
            <p className="ws-hint">Helps us give advice that fits your kind of work.</p>
          </div>
          <div>
            <label className="ws-label" htmlFor="ob-city">City or area <span className="ws-muted">(optional)</span></label>
            <input id="ob-city" className="ws-input" value={form.city} onChange={(e) => update("city", e.target.value)} maxLength={80} autoComplete="address-level2" />
            <p className="ws-hint">Helps us give local advice. We do not show it to anyone.</p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="ws-stack">
          <p className="ws-muted ws-small">Add what you have. Leave anything blank that you do not have yet. We check public pages only.</p>
          <div>
            <label className="ws-label" htmlFor="ob-website">Website <span className="ws-muted">(optional)</span></label>
            <input id="ob-website" className="ws-input" value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="yourbusiness.com" inputMode="url" autoCapitalize="none" maxLength={300} />
            <p className="ws-hint">We open your home page to check it. No website? Leave this empty and we will show you where to start.</p>
          </div>
          <div>
            <label className="ws-label" htmlFor="ob-ig">Instagram handle <span className="ws-muted">(optional)</span></label>
            <input id="ob-ig" className="ws-input" value={form.instagramHandle} onChange={(e) => update("instagramHandle", e.target.value)} placeholder="@yourbusiness" autoCapitalize="none" maxLength={60} />
            <p className="ws-hint">We cannot look inside Instagram, so we take your word for it and do not count it in your score.</p>
          </div>
          <div>
            <label className="ws-label" htmlFor="ob-phone">Phone or WhatsApp number <span className="ws-muted">(optional)</span></label>
            <input id="ob-phone" className="ws-input" value={form.phoneNumber} onChange={(e) => update("phoneNumber", e.target.value)} inputMode="tel" autoComplete="tel" maxLength={30} />
            <p className="ws-hint">So we can tell you whether customers can see how to reach you.</p>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="ws-stack">
          <p className="ws-muted ws-small">Optional. Your Google listing adds your rating and reviews to your score. You can do this later from your overview.</p>
          <GooglePlaceSearch selected={place} onSelect={setPlace} enabled={googleEnabled} />
          <p className="ws-hint">Finding your listing does not prove you own it, and we never change it.</p>
        </div>
      )}

      {error && <Notice tone="danger" live="assertive">{error}</Notice>}

      <div className="ws-row" style={{ justifyContent: "space-between" }}>
        {step > 1 ? <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button> : <span />}
        <Button type="submit" disabled={step === 1 && !nameOk}>{step < STEPS.length ? "Continue" : "Add my business and run my first check"}</Button>
      </div>
    </form>
  );
}
