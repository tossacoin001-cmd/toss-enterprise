import Link from "next/link";
import Hero from "@/components/Hero";

const serviceTeaser = [
  {
    icon: "◉",
    title: "Visibility Systems",
    desc: "Google Maps ranking, local SEO, and Snapchat placement that puts your brand where customers are searching.",
    href: "/services#visibility",
  },
  {
    icon: "◈",
    title: "Revenue Websites",
    desc: "High-converting websites engineered to turn traffic into leads, bookings, and sales.",
    href: "/services#websites",
  },
  {
    icon: "◇",
    title: "AI Applications",
    desc: "Custom portals, dashboards, and tools powered by AI — built for your exact workflow.",
    href: "/services#ai",
  },
  {
    icon: "◆",
    title: "Business Automation",
    desc: "CRM, WhatsApp automation, and follow-up sequences that work while you sleep.",
    href: "/services#automation",
  },
];

const featuredWork = [
  {
    client: "Julie Luxury Spa",
    category: "Revenue Website",
    headline: "Luxury Spa Platform with Booking & WhatsApp Automation",
    stat: "3×",
    statLabel: "Inquiry Growth",
  },
  {
    client: "Prestige Properties",
    category: "AI Application",
    headline: "Real Estate Portal with AI Lead Qualification",
    stat: "70%",
    statLabel: "Lead Quality Up",
  },
  {
    client: "Toss Visibility OS",
    category: "SaaS Platform",
    headline: "Business Visibility Management Dashboard",
    stat: "MRR",
    statLabel: "Recurring Revenue",
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* Services Teaser */}
      <section className="py-28 px-6" style={{ background: "#050E09" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <div className="flex items-center gap-4 mb-5">
                <div className="section-line" />
                <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>
                  What We Build
                </span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-light" style={{ color: "#FAF7F2" }}>
                Four Systems.{" "}
                <span className="gold-text italic">One Mission.</span>
              </h2>
            </div>
            <Link
              href="/services"
              className="btn-outline-gold px-7 py-2.5 text-xs tracking-[0.2em] uppercase shrink-0 text-center"
            >
              All Services →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {serviceTeaser.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="green-card p-8 flex flex-col gap-5 group transition-all duration-300 hover:-translate-y-1"
              >
                <span className="text-2xl" style={{ color: "#C9A96E" }}>
                  {s.icon}
                </span>
                <h3
                  className="font-display text-xl font-medium transition-colors duration-300 group-hover:gold-text"
                  style={{ color: "#FAF7F2" }}
                >
                  {s.title}
                </h3>
                <p className="text-xs leading-relaxed flex-1" style={{ color: "rgba(250,247,242,0.5)" }}>
                  {s.desc}
                </p>
                <span className="text-xs tracking-widest uppercase" style={{ color: "#C9A96E" }}>
                  Learn more →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Work Teaser */}
      <section
        className="py-28 px-6"
        style={{ background: "linear-gradient(180deg, #050E09 0%, #092D22 100%)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <div className="flex items-center gap-4 mb-5">
                <div className="section-line" />
                <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>
                  Featured Work
                </span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-light" style={{ color: "#FAF7F2" }}>
                Systems That{" "}
                <span className="gold-text italic">Perform.</span>
              </h2>
            </div>
            <Link
              href="/work"
              className="btn-outline-gold px-7 py-2.5 text-xs tracking-[0.2em] uppercase shrink-0 text-center"
            >
              See All Work →
            </Link>
          </div>

          <div className="space-y-3">
            {featuredWork.map((p, i) => (
              <Link
                key={p.client}
                href="/work"
                className="work-card group flex flex-col md:flex-row md:items-center justify-between gap-6 p-8"
              >
                <div className="flex items-start gap-6">
                  <span
                    className="font-display text-3xl font-light hidden md:block"
                    style={{ color: "rgba(201,169,110,0.2)" }}
                  >
                    0{i + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="text-xs tracking-[0.2em] uppercase px-2.5 py-1"
                        style={{ border: "1px solid rgba(201,169,110,0.2)", color: "#C9A96E" }}
                      >
                        {p.category}
                      </span>
                      <span className="text-xs" style={{ color: "rgba(250,247,242,0.3)" }}>
                        {p.client}
                      </span>
                    </div>
                    <h3
                      className="font-display text-xl md:text-2xl font-medium"
                      style={{ color: "#FAF7F2" }}
                    >
                      {p.headline}
                    </h3>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display text-3xl font-semibold gold-text">{p.stat}</div>
                  <div
                    className="text-xs tracking-wider uppercase"
                    style={{ color: "rgba(250,247,242,0.35)" }}
                  >
                    {p.statLabel}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-20 px-6" style={{ background: "#092D22" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[
            { value: "50+", label: "Systems Built" },
            { value: "$2M+", label: "Revenue Generated" },
            { value: "30+", label: "Happy Clients" },
            { value: "100%", label: "Satisfaction" },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-display text-4xl md:text-5xl font-semibold gold-text">{s.value}</div>
              <div
                className="text-xs tracking-[0.2em] uppercase mt-2"
                style={{ color: "rgba(250,247,242,0.4)" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Band */}
      <section
        className="py-28 px-6 text-center"
        style={{ background: "#050E09", borderTop: "1px solid rgba(201,169,110,0.08)" }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="section-line" />
            <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>
              Ready?
            </span>
            <div className="section-line" />
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-light leading-[1.1] mb-6" style={{ color: "#FAF7F2" }}>
            Let&apos;s Build Your{" "}
            <span className="gold-text italic">Growth System.</span>
          </h2>
          <p className="text-sm leading-relaxed mb-10" style={{ color: "rgba(250,247,242,0.5)" }}>
            Free 30-minute strategy call. We'll map out exactly what your business needs and what it will produce.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-gold px-10 py-4 text-xs tracking-[0.2em] uppercase">
              Book Strategy Call
            </Link>
            <Link href="/pricing" className="btn-outline-gold px-10 py-4 text-xs tracking-[0.2em] uppercase">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
