"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div
      className="p-5"
      style={{ background: "rgba(9,45,34,0.3)", border: "1px solid rgba(201,169,110,0.15)" }}
    >
      <div className="text-sm font-medium mb-1" style={{ color: "#FAF7F2" }}>
        Connect your Google Business Profile
      </div>
      <p className="text-xs mb-4" style={{ color: "rgba(250,247,242,0.5)" }}>
        This is the biggest lever on your score. Once connected we track your reviews and rating too.
      </p>
      <div className="space-y-3">
        <GooglePlaceSearch selected={place} onSelect={setPlace} enabled={enabled} />
        {enabled && (
          <button
            onClick={connect}
            disabled={!place || saving}
            className="btn-gold px-5 py-2 text-xs tracking-[0.15em] uppercase disabled:opacity-40"
          >
            {saving ? "Connecting…" : "Connect listing"}
          </button>
        )}
        {error && (
          <p className="text-xs" style={{ color: "#fca5a5" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
