"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Notice } from "@/components/ui";
import GooglePlaceSearch, { type SelectedPlace } from "./GooglePlaceSearch";

interface ConnectGoogleCardProps {
  businessId: string;
  /** Whether the server has a Places key; false shows the "opens soon" state. */
  enabled: boolean;
}

/** Shown on a business with no connected Google listing. */
export default function ConnectGoogleCard({ businessId, enabled }: ConnectGoogleCardProps) {
  const router = useRouter();
  const [place, setPlace] = useState<SelectedPlace | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function connect() {
    if (!place) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googlePlaceId: place.placeId, placeSessionToken: place.sessionToken }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not connect the listing.");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect the listing.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="ws-card" aria-labelledby="connect-google-title">
      <h2 id="connect-google-title" className="ws-h2">Connect your Google Business Profile</h2>
      <p className="ws-muted ws-small" style={{ marginTop: "0.3rem" }}>
        This adds your Google listing to your score, and lets us track your reviews and rating. Finding your listing does not prove you own it.
      </p>
      <div className="ws-stack" style={{ marginTop: "0.8rem" }}>
        <GooglePlaceSearch selected={place} onSelect={setPlace} enabled={enabled} />
        {enabled && <Button disabled={!place || saving} onClick={connect}>{saving ? "Connecting..." : "Connect listing"}</Button>}
        {error && <Notice tone="danger" live="assertive">{error}</Notice>}
      </div>
    </section>
  );
}
