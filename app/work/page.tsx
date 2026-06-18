import Link from "next/link";

const projects = [
  {
    number: "01",
    client: "Julie Luxury Spa",
    category: "Revenue Website",
    headline: "Premium Spa Platform with Booking & Lead System",
    description:
      "Full luxury website with real-time booking, WhatsApp automation, and an integrated lead capture funnel. Client saw 3× inquiry volume within 30 days of launch.",
    tags: ["Next.js", "Booking System", "WhatsApp API", "Lead Capture", "Framer Motion"],
    results: [
      { value: "3×", label: "Inquiry Growth" },
      { value: "30 days", label: "To See Results" },
      { value: "100%", label: "Mobile Optimised" },
    ],
  },
  {
    number: "02",
    client: "Prestige Properties",
    category: "AI Application",
    headline: "Real Estate Portal with AI Lead Qualification",
    description:
      "Interactive property listings with an AI assistant that qualifies leads before they reach the agent. Reduced junk enquiries by 70% and increased close rate significantly.",
    tags: ["Next.js", "Supabase", "AI Assistant", "Google Maps API", "PostgreSQL"],
    results: [
      { value: "70%", label: "Lead Quality Up" },
      { value: "2×", label: "Close Rate" },
      { value: "AI", label: "Powered Filtering" },
    ],
  },
  {
    number: "03",
    client: "Ember Restaurant Group",
    category: "Revenue Website",
    headline: "Multi-Location Restaurant Platform with Reservations",
    description:
      "Online reservation system, online ordering integration, and a loyalty program backend — all managed from one dashboard the owner runs alone, with zero technical knowledge required.",
    tags: ["Next.js", "Stripe", "Loyalty System", "Admin Dashboard", "Supabase"],
    results: [
      { value: "40%", label: "Online Revenue Up" },
      { value: "Zero", label: "Staff Overhead" },
      { value: "3", label: "Locations Managed" },
    ],
  },
  {
    number: "04",
    client: "Clarity Medical Centre",
    category: "Business Automation",
    headline: "Patient Booking Portal with Automated Follow-ups",
    description:
      "Appointment booking, patient intake forms, automated reminder sequences, and a full admin portal. No-show rate dropped 90% after the automated reminder system went live.",
    tags: ["Next.js", "Supabase", "Automation", "Patient Portal", "Email API"],
    results: [
      { value: "90%", label: "No-Show Reduction" },
      { value: "Zero", label: "Manual Follow-ups" },
      { value: "24/7", label: "Self-Service Booking" },
    ],
  },
  {
    number: "05",
    client: "Toss Visibility OS",
    category: "SaaS Platform",
    headline: "Business Visibility Management Dashboard",
    description:
      "A multi-tenant SaaS platform where businesses track Google visibility, manage reviews, monitor competitors, and generate social content — all in one subscription-based platform.",
    tags: ["Next.js", "PostgreSQL", "Stripe Subscriptions", "AI Content Gen", "Analytics"],
    results: [
      { value: "MRR", label: "Recurring Revenue" },
      { value: "Multi", label: "Tenant Architecture" },
      { value: "AI", label: "Content Generation" },
    ],
  },
];

export default function WorkPage() {
  return (
    <>
      {/* Page Header */}
      <section
        className="pt-40 pb-20 px-6"
        style={{ background: "linear-gradient(180deg, #092D22 0%, #050E09 100%)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="section-line" />
            <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>
              Our Work
            </span>
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-light leading-[1.05] mb-6" style={{ color: "#FAF7F2" }}>
            Five Elite
            <br />
            <span className="gold-text italic">Systems.</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}>
            We don't dilute quality across 50 projects. Every system we build is engineered to perform at the top of its industry.
          </p>
        </div>
      </section>

      {/* Projects */}
      <section className="px-6 pb-28" style={{ background: "#050E09" }}>
        <div className="max-w-7xl mx-auto space-y-3">
          {projects.map((p) => (
            <div
              key={p.number}
              className="group"
              style={{ border: "1px solid rgba(201,169,110,0.1)", background: "rgba(9,45,34,0.2)" }}
            >
              <div className="p-10 md:p-14">
                {/* Top */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="font-display text-5xl font-light"
                        style={{ color: "rgba(201,169,110,0.2)" }}
                      >
                        {p.number}
                      </span>
                      <div>
                        <span
                          className="text-xs tracking-[0.2em] uppercase px-3 py-1 block mb-1"
                          style={{ border: "1px solid rgba(201,169,110,0.25)", color: "#C9A96E" }}
                        >
                          {p.category}
                        </span>
                        <span className="text-xs" style={{ color: "rgba(250,247,242,0.35)" }}>
                          {p.client}
                        </span>
                      </div>
                    </div>
                    <h2
                      className="font-display text-3xl md:text-4xl font-medium mb-5"
                      style={{ color: "#FAF7F2" }}
                    >
                      {p.headline}
                    </h2>
                    <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "rgba(250,247,242,0.55)" }}>
                      {p.description}
                    </p>
                  </div>
                </div>

                {/* Results */}
                <div
                  className="grid grid-cols-3 gap-4 mb-8 p-6"
                  style={{ background: "rgba(201,169,110,0.04)", border: "1px solid rgba(201,169,110,0.08)" }}
                >
                  {p.results.map((r) => (
                    <div key={r.label} className="text-center">
                      <div className="font-display text-2xl md:text-3xl font-semibold gold-text">
                        {r.value}
                      </div>
                      <div
                        className="text-xs tracking-wider uppercase mt-1"
                        style={{ color: "rgba(250,247,242,0.4)" }}
                      >
                        {r.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-3 py-1.5 tracking-wide"
                      style={{
                        background: "rgba(201,169,110,0.05)",
                        border: "1px solid rgba(201,169,110,0.12)",
                        color: "rgba(201,169,110,0.65)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        className="py-24 px-6 text-center"
        style={{ background: "#092D22", borderTop: "1px solid rgba(201,169,110,0.08)" }}
      >
        <div className="max-w-xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-light mb-6" style={{ color: "#FAF7F2" }}>
            Ready to be{" "}
            <span className="gold-text italic">next?</span>
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(250,247,242,0.5)" }}>
            Let's build a system that belongs in this portfolio.
          </p>
          <Link href="/contact" className="btn-gold inline-block px-10 py-4 text-xs tracking-[0.2em] uppercase">
            Start Your Project
          </Link>
        </div>
      </section>
    </>
  );
}
