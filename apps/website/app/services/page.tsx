import Link from "next/link";

const services = [
  {
    id: "visibility",
    number: "01",
    title: "Visibility Systems",
    tagline: "Be found before your competitors.",
    description:
      "Most businesses are invisible online. We engineer multi-channel visibility systems that put your brand at the top of Google, on local maps, and in front of buyers actively searching for what you offer.",
    items: [
      { name: "Google Business Setup", desc: "Full profile optimization, category mapping, and photo strategy to dominate local search." },
      { name: "Google Maps Ranking", desc: "Citation building, review generation, and proximity signals to rank higher on Google Maps." },
      { name: "Local SEO", desc: "On-page and off-page optimization targeting the exact searches your customers make." },
      { name: "Snapchat Map Placement", desc: "Business placement on Snapchat Maps for maximum exposure to a younger, mobile-first audience." },
    ],
    cta: "Get Visible",
  },
  {
    id: "websites",
    number: "02",
    title: "Revenue Websites",
    tagline: "Built to convert, not just look good.",
    description:
      "A beautiful website that doesn't convert is an expensive decoration. Every site we build has a clear conversion architecture — moving visitors through a deliberate journey that ends with them taking action.",
    items: [
      { name: "Luxury Website Design", desc: "Premium design that commands respect and positions your brand at the top of your market." },
      { name: "Conversion Funnels", desc: "Multi-step sequences designed to capture, qualify, and convert leads automatically." },
      { name: "Booking Systems", desc: "Real-time appointment booking integrated directly into your site and calendar." },
      { name: "Lead Capture", desc: "Forms, popups, and lead magnets that grow your database even when you're offline." },
    ],
    cta: "Build My Website",
  },
  {
    id: "ai",
    number: "03",
    title: "AI Applications",
    tagline: "Custom software that thinks.",
    description:
      "We build AI-powered tools your business actually uses — not demos. From customer portals to internal dashboards, every application is engineered around your exact workflow and team.",
    items: [
      { name: "Customer Portals", desc: "Branded portals where clients can manage their account, orders, and communication." },
      { name: "Internal Tools", desc: "Custom dashboards and admin systems that replace manual spreadsheet-based work." },
      { name: "AI Assistants", desc: "Chatbots and AI agents trained on your business that handle enquiries 24/7." },
      { name: "Lead Management Systems", desc: "End-to-end pipeline management from first contact to closed deal." },
    ],
    cta: "Build My App",
  },
  {
    id: "automation",
    number: "04",
    title: "Business Automation",
    tagline: "Grow without growing headcount.",
    description:
      "Every manual task your team repeats daily is a candidate for automation. We map your workflows and systematically replace human labour with intelligent automation that runs 24/7.",
    items: [
      { name: "CRM Setup", desc: "Full CRM implementation with pipelines, automations, and team onboarding." },
      { name: "WhatsApp Automation", desc: "Automated follow-ups, broadcasts, and customer service via WhatsApp Business API." },
      { name: "Lead Follow-up Sequences", desc: "Multi-touch email and message sequences that nurture leads until they're ready to buy." },
      { name: "AI Workflows", desc: "n8n and Zapier workflows that connect your tools and eliminate manual data entry." },
    ],
    cta: "Automate My Business",
  },
];

export default function ServicesPage() {
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
              Services
            </span>
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-light leading-[1.05] mb-6" style={{ color: "#FAF7F2" }}>
            What We
            <br />
            <span className="gold-text italic">Build.</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}>
            Four integrated systems. Each one engineered to solve a specific business problem and compound in value over time.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="px-6 pb-28" style={{ background: "#050E09" }}>
        <div className="max-w-7xl mx-auto space-y-2">
          {services.map((s) => (
            <div
              key={s.id}
              id={s.id}
              className="group"
              style={{ border: "1px solid rgba(201,169,110,0.1)", background: "rgba(9,45,34,0.2)" }}
            >
              {/* Header */}
              <div className="p-10 md:p-14 grid md:grid-cols-[120px_1fr] gap-8 items-start">
                <div
                  className="font-display text-7xl font-light leading-none"
                  style={{ color: "rgba(201,169,110,0.15)" }}
                >
                  {s.number}
                </div>
                <div>
                  <span
                    className="text-xs tracking-[0.3em] uppercase mb-3 block"
                    style={{ color: "#C9A96E" }}
                  >
                    {s.tagline}
                  </span>
                  <h2
                    className="font-display text-4xl md:text-5xl font-medium mb-6"
                    style={{ color: "#FAF7F2" }}
                  >
                    {s.title}
                  </h2>
                  <p className="text-base leading-relaxed max-w-2xl mb-10" style={{ color: "rgba(250,247,242,0.55)" }}>
                    {s.description}
                  </p>

                  {/* Sub-items */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-10">
                    {s.items.map((item) => (
                      <div
                        key={item.name}
                        className="p-6"
                        style={{ border: "1px solid rgba(201,169,110,0.1)", background: "rgba(5,14,9,0.5)" }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-1 h-4" style={{ background: "#C9A96E" }} />
                          <h3 className="text-sm font-medium" style={{ color: "#FAF7F2" }}>
                            {item.name}
                          </h3>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: "rgba(250,247,242,0.45)" }}>
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Link href="/contact" className="btn-gold inline-block px-8 py-3 text-xs tracking-[0.2em] uppercase">
                    {s.cta} →
                  </Link>
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
            Not sure which system{" "}
            <span className="gold-text italic">you need?</span>
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(250,247,242,0.5)" }}>
            Book a free strategy call. We'll diagnose your biggest growth gap and recommend exactly what to build first.
          </p>
          <Link href="/contact" className="btn-gold inline-block px-10 py-4 text-xs tracking-[0.2em] uppercase">
            Book Free Strategy Call
          </Link>
        </div>
      </section>
    </>
  );
}
