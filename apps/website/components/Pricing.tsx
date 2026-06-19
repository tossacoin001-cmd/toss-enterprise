"use client";
import { useState } from "react";

const tiers = [
  {
    name: "Starter",
    price: "$1,500",
    tagline: "Your first digital impression, done right.",
    description: "A high-converting landing page that captures leads and sells your offer 24/7.",
    features: [
      "Custom landing page design",
      "Mobile-first responsive build",
      "Lead capture form",
      "WhatsApp integration",
      "Basic SEO setup",
      "7-day delivery",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$3,500",
    tagline: "A full business presence with automation.",
    description: "A complete business website plus CRM and automated follow-up sequences.",
    features: [
      "Multi-page website",
      "CRM integration",
      "Booking / enquiry system",
      "WhatsApp automation",
      "Google Business setup",
      "Analytics dashboard",
      "14-day delivery",
    ],
    cta: "Most Popular",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "$7,500",
    tagline: "A custom platform built for scale.",
    description: "A full custom web application with user accounts, dashboards, and integrations.",
    features: [
      "Custom platform design",
      "User authentication",
      "Admin dashboard",
      "Payment integration",
      "API connections",
      "AI feature integration",
      "30-day build timeline",
    ],
    cta: "Build My Platform",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "$15,000+",
    tagline: "Complete business infrastructure.",
    description: "Full AI-powered system with automation, custom software, and ongoing growth management.",
    features: [
      "Everything in Premium",
      "AI automation systems",
      "Multi-platform integration",
      "Dedicated build team",
      "Priority support",
      "Monthly growth retainer",
      "Bespoke timeline",
    ],
    cta: "Let's Talk",
    highlighted: false,
  },
];

export default function Pricing() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="pricing" className="py-32 px-6" style={{ background: "linear-gradient(180deg, #050E09 0%, #092D22 100%)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-20 text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="section-line" />
            <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>
              Investment
            </span>
            <div className="section-line" />
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-light leading-[1.1] mb-6" style={{ color: "#FAF7F2" }}>
            Transparent
            <br />
            <span className="gold-text italic">Pricing.</span>
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}>
            No hourly billing. No surprise invoices. Fixed-scope packages so you know exactly what you're getting and what it costs.
          </p>
        </div>

        {/* Tiers */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((t, i) => (
            <div
              key={t.name}
              className="relative flex flex-col transition-all duration-400 cursor-default"
              style={{
                background: t.highlighted
                  ? "linear-gradient(135deg, #0D4535, #0A3728)"
                  : hovered === i
                  ? "rgba(13,63,46,0.6)"
                  : "rgba(9,45,34,0.3)",
                border: t.highlighted
                  ? "1px solid rgba(201,169,110,0.5)"
                  : `1px solid ${hovered === i ? "rgba(201,169,110,0.25)" : "rgba(201,169,110,0.1)"}`,
                transform: t.highlighted ? "scale(1.02)" : hovered === i ? "translateY(-4px)" : "none",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {t.highlighted && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs tracking-[0.2em] uppercase font-medium"
                  style={{ background: "#C9A96E", color: "#092D22" }}
                >
                  Most Popular
                </div>
              )}

              <div className="p-8 flex flex-col h-full">
                {/* Tier name */}
                <div
                  className="text-xs tracking-[0.3em] uppercase mb-4"
                  style={{ color: "#C9A96E" }}
                >
                  {t.name}
                </div>

                {/* Price */}
                <div className="font-display text-4xl font-semibold mb-2" style={{ color: "#FAF7F2" }}>
                  {t.price}
                </div>

                <div className="text-xs mb-4" style={{ color: "rgba(250,247,242,0.5)" }}>
                  {t.tagline}
                </div>

                <div
                  className="w-full h-px mb-6"
                  style={{ background: "rgba(201,169,110,0.15)" }}
                />

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#C9A96E"
                        strokeWidth="2.5"
                        className="mt-0.5 shrink-0"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-xs leading-relaxed" style={{ color: "rgba(250,247,242,0.65)" }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href="#contact"
                  className={`block text-center py-3.5 text-xs tracking-[0.2em] uppercase transition-all duration-300 ${
                    t.highlighted ? "btn-gold" : "btn-outline-gold"
                  }`}
                >
                  {t.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Retainer note */}
        <div
          className="mt-12 p-8 text-center"
          style={{ border: "1px solid rgba(201,169,110,0.1)", background: "rgba(9,45,34,0.2)" }}
        >
          <p className="text-sm" style={{ color: "rgba(250,247,242,0.5)" }}>
            Every build is eligible for our{" "}
            <span style={{ color: "#C9A96E" }}>Monthly Growth Retainer</span> — hosting, SEO, visibility management, and optimization from{" "}
            <span style={{ color: "#FAF7F2" }}>$300/mo</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
