import type { Metadata } from "next";
import Link from "next/link";
import { BOOKING_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Digital Products — Toss Enterprise",
  description: "Curated digital products, templates, and resources for ambitious brands. Launching soon from Toss Enterprise.",
};

export default function ProductsPage() {
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "linear-gradient(180deg, #092D22 0%, #050E09 100%)" }}
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="section-line" />
        <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>Coming Soon</span>
        <div className="section-line" />
      </div>
      <div className="w-20 h-20 flex items-center justify-center mb-10"
        style={{ border: "1px solid rgba(201,169,110,0.25)" }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      </div>
      <h1 className="font-display text-5xl md:text-7xl font-light leading-[1.05] mb-6" style={{ color: "#FAF7F2" }}>
        Digital Products<br /><span className="gold-text italic">Dropping Soon.</span>
      </h1>
      <p className="text-base leading-relaxed max-w-md mb-12" style={{ color: "rgba(250,247,242,0.5)" }}>
        Curated digital products, templates, and resources — everything ambitious brands need to grow faster. Launching shortly.
      </p>
      <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer"
        className="btn-gold inline-block px-10 py-4 text-xs tracking-[0.2em] uppercase">
        Get Notified at Launch
      </a>
      <div className="mt-12">
        <Link href="/" className="text-xs tracking-[0.2em] uppercase transition-colors duration-300"
          style={{ color: "rgba(250,247,242,0.35)" }}>
          ← Back to Home
        </Link>
      </div>
    </section>
  );
}
