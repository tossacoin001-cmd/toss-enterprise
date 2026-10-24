"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Notice } from "@/components/ui";

type Fields = { name: string; category: string; city: string; website: string; instagramHandle: string; phoneNumber: string };

/** Changes the details the owner typed. Takes effect at the next check; it does not run one. */
export default function EditBusiness({ id, initial }: { id: string; initial: Fields }) {
  const router = useRouter();
  const [form, setForm] = useState<Fields>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2) { setError("Business name is required."); return; }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/businesses/${id}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) { setError(data.error ?? "Could not save. Please try again."); setBusy(false); return; }
      router.push(`/businesses/${id}`);
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <form className="ws-card ws-stack" onSubmit={save} noValidate>
      {error ? <Notice tone="danger">{error}</Notice> : null}
      <div>
        <label className="ws-label" htmlFor="eb-name">Business name</label>
        <input id="eb-name" className="ws-input" value={form.name} onChange={set("name")} maxLength={120} required />
      </div>
      <div>
        <label className="ws-label" htmlFor="eb-category">What you do <span className="ws-muted">(optional)</span></label>
        <input id="eb-category" className="ws-input" value={form.category} onChange={set("category")} maxLength={80} />
      </div>
      <div>
        <label className="ws-label" htmlFor="eb-city">City or area <span className="ws-muted">(optional)</span></label>
        <input id="eb-city" className="ws-input" value={form.city} onChange={set("city")} maxLength={80} />
      </div>
      <div>
        <label className="ws-label" htmlFor="eb-website">Website <span className="ws-muted">(optional)</span></label>
        <input id="eb-website" className="ws-input" value={form.website} onChange={set("website")} inputMode="url" autoCapitalize="none" maxLength={300} />
      </div>
      <div>
        <label className="ws-label" htmlFor="eb-ig">Instagram handle <span className="ws-muted">(optional)</span></label>
        <input id="eb-ig" className="ws-input" value={form.instagramHandle} onChange={set("instagramHandle")} autoCapitalize="none" maxLength={60} />
      </div>
      <div>
        <label className="ws-label" htmlFor="eb-phone">Phone or WhatsApp number <span className="ws-muted">(optional)</span></label>
        <input id="eb-phone" className="ws-input" value={form.phoneNumber} onChange={set("phoneNumber")} inputMode="tel" maxLength={30} />
      </div>
      <p className="ws-hint">Changes apply the next time we check. Your past results are kept as they were.</p>
      <div className="ws-row" style={{ justifyContent: "space-between" }}>
        <Button href={`/businesses/${id}`} variant="ghost">Cancel</Button>
        <Button type="submit" disabled={busy}>{busy ? "Saving" : "Save changes"}</Button>
      </div>
    </form>
  );
}
