import Link from "next/link";

const tiers = [
  {
    name: "Starter",
    price: "$1,500",
    tagline: "Your first digital impression, done right.",
    description: "A high-converting landing page that captures leads and sells your offer 24/7.",
    delivery: "7-day delivery",
    features: [
      "Custom landing page design",
      "Mobile-first responsive build",
      "Lead capture form",
      "WhatsApp integration",
      "Basic SEO setup",
      "Google Analytics setup",
      "30-day support",
    ],
    highlighted: false,
    cta: "Get Started",
  },
  {
    name: "Growth",
    price: "$3,500",
    tagline: "A full business presence with automation.",
    description: "A complete business website plus CRM setup and automated follow-up sequences.",
    delivery: "14-day delivery",
    features: [
      "Multi-page website (up to 8 pages)",
      "CRM integration",
      "Booking / enquiry system",
      "WhatsApp automation",
      "Google Business setup",
      "Local SEO foundation",
      "Analytics dashboard",
      "60-day support",
    ],
    highlighted: true,
    cta: "Most Popular — Start Now",
  },
  {
    name: "Premium",
    price: "$7,500",
    tagline: "A custom platform built for scale.",
    description: "A full custom web application with user accounts, dashboards, and integrations.",
    delivery: "30-day build",
    features: [
      "Custom platform design",
      "User authentication system",
      "Admin dashboard",
      "Payment integration (Stripe)",
      "API connections",
      "AI feature integration",
      "Advanced analytics",
      "90-day support",
    ],
    highlighted: false,
    cta: "Build My Platform",
  },
  {
    name: "Enterprise",
    price: "$15,000+",
    tagline: "Complete business infrastructure.",
    description:
      "Full AI-powered system with automation, custom software, and ongoing growth management.",
    delivery: "Bespoke timeline",
    features: [
      "Everything in Premium",
      "AI automation systems",
      "Multi-platform integration",
      "Dedicated build team",
      "Priority 24/7 support",
      "Monthly growth retainer",
      "Quarterly strategy reviews",
      "Custom SLA agreement",
    ],
    highlighted: false,
    cta: "Schedule a Call",
  },
];

const retainerFeatures = [
  { name: "Hosting & Deployment", desc: "Managed hosting on Vercel with 99.9% uptime SLA." },
  { name: "Monthly SEO", desc: "On-page optimisation, keyword tracking, and ranking reports." },
  { name: "Visibility Management", desc: "Google Business and Maps optimisation, review management." },
  { name: "Analytics Reporting", desc: "Monthly performance report with actionable recommendations." },
  { name: "Content Updates", desc: "Up to 4 content or minor design updates per month." },
  { name: "Priority Support", desc: "Fast-track response for any technical issues or questions." },
];

export default function PricingPage() {
  return (
    <>
      {/* Header */}
      <section
        className="pt-40 pb-20 px-6"
        style={{ background: "linear-gradient(180deg, #092D22 0%, #050E09 100%)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="section-line" />
            <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>
              Investment
            </span>
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-light leading-[1.05] mb-6" style={{ color: "#FAF7F2" }}>
            Transparent
            <br />
            <span className="gold-text italic">Pricing.</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}>
            Fixed-scope packages. No hourly billing. No surprise invoices. You know exactly what you're getting before you invest.
          </p>
        </div>
      </section>

      {/* Tiers */}
      <section className="px-6 pb-16" style={{ background: "#050E09" }}>
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((t) => (
            <div
              key={t.name}
              className="flex flex-col relative"
              style={{
                background: t.highlighted
                  ? "linear-gradient(135deg, #0D4535, #0A3728)"
                  : "rgba(9,45,34,0.3)",
                border: t.highlighted
                  ? "1px solid rgba(201,169,110,0.45)"
                  : "1px solid rgba(201,169,110,0.1)",
                transform: t.highlighted ? "scale(1.02)" : "none",
              }}
            >
              {t.highlighted && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs tracking-[0.2em] uppercase font-medium whitespace-nowrap"
                  style={{ background: "#C9A96E", color: "#092D22" }}
                >
                  Most Popular
                </div>
              )}

              <div className="p-8 flex flex-col h-full">
                <div className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#C9A96E" }}>
                  {t.name}
                </div>
                <div className="font-display text-4xl font-semibold mb-1" style={{ color: "#FAF7F2" }}>
                  {t.price}
                </div>
                <div className="text-xs mb-1" style={{ color: "rgba(250,247,242,0.45)" }}>
                  {t.tagline}
                </div>
                <div
                  className="text-xs px-2 py-1 inline-block mb-5 mt-2"
                  style={{ border: "1px solid rgba(201,169,110,0.15)", color: "rgba(201,169,110,0.6)" }}
                >
                  {t.delivery}
                </div>

                <div className="h-px mb-6" style={{ background: "rgba(201,169,110,0.12)" }} />

                <ul className="space-y-3 mb-8 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <svg
                        width="13"
                        height="13"
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

                <Link
                  href="/contact"
                  className={`block text-center py-3.5 text-xs tracking-[0.18em] uppercase transition-all duration-300 ${
                    t.highlighted ? "btn-gold" : "btn-outline-gold"
                  }`}
                >
                  {t.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Retainer */}
      <section
        className="py-24 px-6"
        style={{ background: "#092D22", borderTop: "1px solid rgba(201,169,110,0.08)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="section-line" />
                <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>
                  Monthly Retainer
                </span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-light mb-6" style={{ color: "#FAF7F2" }}>
                Keep Growing
                <br />
                <span className="gold-text italic">After Launch.</span>
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: "rgba(250,247,242,0.55)" }}>
                A website without ongoing management loses ground. Our monthly retainers keep your systems maintained, optimised, and growing — without you lifting a finger.
              </p>
              <div className="font-display text-4xl gold-text font-semibold mb-2">$300 – $2,000</div>
              <div className="text-xs tracking-wider uppercase" style={{ color: "rgba(250,247,242,0.4)" }}>
                Per month — scope-dependent
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/retainer" className="btn-gold inline-block px-8 py-3.5 text-xs tracking-[0.2em] uppercase text-center">
                  Build My Retainer Plan →
                </Link>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {retainerFeatures.map((f) => (
                <div
                  key={f.name}
                  className="p-6"
                  style={{ border: "1px solid rgba(201,169,110,0.1)", background: "rgba(5,14,9,0.4)" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-3" style={{ background: "#C9A96E" }} />
                    <h3 className="text-sm font-medium" style={{ color: "#FAF7F2" }}>
                      {f.name}
                    </h3>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(250,247,242,0.45)" }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center" style={{ background: "#050E09" }}>
        <div className="max-w-xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-light mb-6" style={{ color: "#FAF7F2" }}>
            Not sure which{" "}
            <span className="gold-text italic">tier fits?</span>
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(250,247,242,0.5)" }}>
            Book a free strategy call. We'll recommend the right scope for your business and budget.
          </p>
          <Link href="/contact" className="btn-gold inline-block px-10 py-4 text-xs tracking-[0.2em] uppercase">
            Book Free Strategy Call
          </Link>
        </div>
      </section>
    </>
  );
}
