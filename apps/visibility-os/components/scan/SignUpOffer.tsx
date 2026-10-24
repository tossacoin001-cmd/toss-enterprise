"use client";

import Link from "next/link";
import { useState } from "react";

/** Shown after the full result. The result stays on screen whatever the visitor chooses. */
export default function SignUpOffer({ text, watch, scanId }: { text: string; watch?: string; scanId?: string }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <section className="green-card p-6 sm:p-8" aria-labelledby="signup-title">
      <h2 id="signup-title" className="font-display text-2xl font-light mb-3" style={{ color: "#FAF7F2" }}>
        Keep this and watch it improve
      </h2>
      <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(250,247,242,0.7)" }}>
        {text}
      </p>
      {watch && (
        <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(250,247,242,0.7)" }}>
          {watch}
        </p>
      )}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href={scanId ? `/sign-up?redirect_url=${encodeURIComponent(`/onboarding?scan=${scanId}`)}` : "/sign-up"} className="btn-gold inline-flex items-center min-h-12 px-8 text-xs tracking-[0.2em] uppercase focus-visible:ring-2 focus-visible:ring-white">
          Save my result
        </Link>
        <button type="button" onClick={() => setHidden(true)} className="min-h-12 px-4 text-sm underline underline-offset-4" style={{ color: "rgba(250,247,242,0.6)" }}>
          No thanks
        </button>
      </div>
    </section>
  );
}
