"use client";

const projects = [
  {
    number: "01",
    client: "Julie Luxury Spa",
    category: "Revenue Website",
    headline: "Premium Spa Platform with Booking & Lead System",
    description:
      "Full luxury website with real-time booking, WhatsApp automation, and an integrated lead capture funnel. Client saw 3x inquiry volume within 30 days.",
    tags: ["Next.js", "Booking System", "WhatsApp API", "Lead Capture"],
    stat: { value: "3×", label: "Inquiry Growth" },
    color: "#1a4a35",
  },
  {
    number: "02",
    client: "Prestige Properties",
    category: "AI Application",
    headline: "Real Estate Platform with AI Lead Qualification",
    description:
      "Interactive property listings with an AI assistant that qualifies leads before they reach the agent. Reduced junk inquiries by 70% and increased close rate.",
    tags: ["Next.js", "Supabase", "AI Assistant", "Maps API"],
    stat: { value: "70%", label: "Lead Quality Up" },
    color: "#1a3a4a",
  },
  {
    number: "03",
    client: "Ember Restaurant Group",
    category: "Revenue Website",
    headline: "Multi-Location Restaurant Platform with Reservations",
    description:
      "Online reservation system, ordering integration, and a loyalty program backend — all tied into one dashboard the owner manages alone.",
    tags: ["Next.js", "Stripe", "Loyalty System", "Admin Dashboard"],
    stat: { value: "40%", label: "Online Revenue Up" },
    color: "#3a2a10",
  },
  {
    number: "04",
    client: "Clarity Medical Centre",
    category: "Business Automation",
    headline: "Patient Booking Portal with Automated Follow-ups",
    description:
      "Appointment booking, patient intake forms, reminder sequences, and an admin portal for the clinic team. Zero manual follow-up required.",
    tags: ["Next.js", "Supabase", "Automation", "Patient Portal"],
    stat: { value: "90%", label: "No-Show Reduction" },
    color: "#1a2a4a",
  },
  {
    number: "05",
    client: "Toss Visibility OS",
    category: "SaaS Platform",
    headline: "Business Visibility Management Dashboard",
    description:
      "A SaaS platform where businesses track Google visibility, manage reviews, monitor competitors, and generate content — all in one place.",
    tags: ["Next.js", "PostgreSQL", "AI", "Subscriptions"],
    stat: { value: "MRR", label: "Recurring Revenue" },
    color: "#2a1a4a",
  },
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-32 px-6" style={{ background: "linear-gradient(180deg, #050E09 0%, #092D22 50%, #050E09 100%)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="section-line" />
              <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>
                Our Work
              </span>
            </div>
            <h2 className="font-display text-5xl md:text-6xl font-light leading-[1.1]" style={{ color: "#FAF7F2" }}>
              Five Elite
              <br />
              <span className="gold-text italic">Systems.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}>
            We don't dilute quality across 50 projects. We engineer a small number of exceptional systems that set the standard for each industry.
          </p>
        </div>

        {/* Projects */}
        <div className="space-y-4">
          {projects.map((p, i) => (
            <div
              key={p.number}
              className="group relative overflow-hidden transition-all duration-500 cursor-pointer"
              style={{
                border: "1px solid rgba(201,169,110,0.12)",
                background: "rgba(9,45,34,0.4)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,169,110,0.35)";
                (e.currentTarget as HTMLElement).style.background = `rgba(${parseInt(p.color.slice(1,3),16)},${parseInt(p.color.slice(3,5),16)},${parseInt(p.color.slice(5,7),16)},0.3)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,169,110,0.12)";
                (e.currentTarget as HTMLElement).style.background = "rgba(9,45,34,0.4)";
              }}
            >
              <div className="p-8 md:p-10 grid md:grid-cols-[80px_1fr_auto] gap-6 md:gap-10 items-start">
                {/* Number */}
                <div
                  className="font-display text-5xl font-light leading-none hidden md:block"
                  style={{ color: "rgba(201,169,110,0.2)" }}
                >
                  {p.number}
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="text-xs tracking-[0.25em] uppercase px-3 py-1"
                      style={{ border: "1px solid rgba(201,169,110,0.25)", color: "#C9A96E" }}
                    >
                      {p.category}
                    </span>
                    <span className="text-xs" style={{ color: "rgba(250,247,242,0.35)" }}>
                      {p.client}
                    </span>
                  </div>
                  <h3
                    className="font-display text-2xl md:text-3xl font-medium mb-3 transition-colors duration-300"
                    style={{ color: "#FAF7F2" }}
                  >
                    {p.headline}
                  </h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(250,247,242,0.5)" }}>
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2.5 py-1 tracking-wide"
                        style={{ background: "rgba(201,169,110,0.06)", color: "rgba(201,169,110,0.6)", border: "1px solid rgba(201,169,110,0.1)" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stat */}
                <div className="text-right md:text-center md:min-w-[100px]">
                  <div className="font-display text-4xl font-semibold gold-text">{p.stat.value}</div>
                  <div className="text-xs tracking-wider uppercase mt-1" style={{ color: "rgba(250,247,242,0.4)" }}>
                    {p.stat.label}
                  </div>
                </div>
              </div>

              {/* Hover accent line */}
              <div
                className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-700"
                style={{ background: "linear-gradient(90deg, transparent, #C9A96E, transparent)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
