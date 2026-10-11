"use client";

import type { Audience } from "@/lib/scan-ui/request";

type Card = { audience: Audience; title: string; text: string; cta: string; art: React.ReactNode };

/** Three cards, one for each kind of visitor. Choosing one fills in the scan box above and takes them to it. */
export default function AudienceCards({ cards }: { cards: Card[] }) {
  function choose(audience: Audience) {
    window.dispatchEvent(new CustomEvent("tvo-audience", { detail: audience }));
    document.getElementById("scan")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div key={c.audience} className="green-card p-6 flex flex-col items-start gap-4">
          {c.art}
          <h3 className="font-display text-2xl font-light" style={{ color: "#FAF7F2" }}>{c.title}</h3>
          <p className="text-sm leading-relaxed flex-1" style={{ color: "rgba(250,247,242,0.65)" }}>{c.text}</p>
          <button
            type="button"
            onClick={() => choose(c.audience)}
            className="btn-outline-gold inline-flex items-center min-h-11 px-5 text-xs tracking-[0.15em] uppercase focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
          >
            {c.cta}
          </button>
        </div>
      ))}
    </div>
  );
}
