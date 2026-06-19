"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { BOOKING_URL } from "@/lib/config";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const featuredWork = [
  {
    client: "Julie Luxury Spa",
    category: "Revenue Website",
    headline: "Luxury Spa Platform with Booking & WhatsApp Automation",
    stat: "3×",
    statLabel: "Inquiry Growth",
    color: "#C9A96E",
  },
  {
    client: "Prestige Properties",
    category: "AI Application",
    headline: "Real Estate Portal with AI Lead Qualification",
    stat: "70%",
    statLabel: "Lead Quality Up",
    color: "#C9A96E",
  },
  {
    client: "Toss Visibility OS",
    category: "SaaS Platform",
    headline: "Business Visibility Management Dashboard",
    stat: "MRR",
    statLabel: "Recurring Revenue",
    color: "#C9A96E",
  },
];

const whyUs = [
  {
    icon: "⚡",
    title: "Fast by Design",
    desc: "Most agencies take 3 months. We launch in weeks — without cutting corners.",
  },
  {
    icon: "🎯",
    title: "Built to Convert",
    desc: "Everything we make has one goal: more calls, leads, and revenue for you.",
  },
  {
    icon: "🤝",
    title: "Real Partnership",
    desc: "We don't disappear after launch. We grow with you, long term.",
  },
  {
    icon: "🧠",
    title: "AI-Powered Edge",
    desc: "We build with the latest AI tools so you outpace competition.",
  },
];

export default function HomeSections() {
  return (
    <>
      {/* ── Why Us ──────────────────────────────────────────────────────── */}
      <section className="py-28 px-6" style={{ background: "#050E09" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
          >
            <div>
              <div className="flex items-center gap-4 mb-5">
                <div className="section-line" />
                <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>
                  Why Toss
                </span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-light" style={{ color: "#FAF7F2" }}>
                Not Your Average{" "}
                <span className="gold-text italic">Agency.</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}>
              We're builders, not order-takers. You get a team obsessed with your results.
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          >
            {whyUs.map((w) => (
              <motion.div
                key={w.title}
                variants={fadeUp}
                className="green-card p-8 flex flex-col gap-4 group cursor-default"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <span className="text-3xl">{w.icon}</span>
                <h3 className="font-display text-xl font-medium" style={{ color: "#FAF7F2" }}>
                  {w.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}>
                  {w.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Featured Work ────────────────────────────────────────────────── */}
      <section
        className="py-28 px-6"
        style={{ background: "linear-gradient(180deg, #050E09 0%, #092D22 100%)" }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
          >
            <div>
              <div className="flex items-center gap-4 mb-5">
                <div className="section-line" />
                <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>
                  Real Results
                </span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-light" style={{ color: "#FAF7F2" }}>
                Systems That{" "}
                <span className="gold-text italic">Perform.</span>
              </h2>
            </div>
            <Link href="/work" className="btn-outline-gold px-7 py-2.5 text-xs tracking-[0.2em] uppercase shrink-0">
              See All Work →
            </Link>
          </motion.div>

          <motion.div
            className="space-y-3"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          >
            {featuredWork.map((p, i) => (
              <motion.div key={p.client} variants={fadeUp}>
                <Link
                  href="/work"
                  className="work-card group flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 block"
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
                      <h3 className="font-display text-xl md:text-2xl font-medium" style={{ color: "#FAF7F2" }}>
                        {p.headline}
                      </h3>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display text-3xl font-semibold gold-text">{p.stat}</div>
                    <div className="text-xs tracking-wider uppercase" style={{ color: "rgba(250,247,242,0.35)" }}>
                      {p.statLabel}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Social Proof / Testimonial strip ────────────────────────────── */}
      <section className="py-16 px-6 overflow-hidden" style={{ background: "#092D22", borderTop: "1px solid rgba(201,169,110,0.08)", borderBottom: "1px solid rgba(201,169,110,0.08)" }}>
        <motion.div
          className="flex items-center gap-16 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ width: "max-content" }}
        >
          {[
            '"Best investment I made for my spa." — Julie M.',
            '"Leads tripled in 60 days." — Prestige Properties',
            '"Finally a team that delivers." — Spa Owner, Dubai',
            '"The AI assistant saved us hours daily." — Tech Startup',
            '"Professional, fast, and results-driven." — Real Estate Client',
            '"Best investment I made for my spa." — Julie M.',
            '"Leads tripled in 60 days." — Prestige Properties',
            '"Finally a team that delivers." — Spa Owner, Dubai',
            '"The AI assistant saved us hours daily." — Tech Startup',
            '"Professional, fast, and results-driven." — Real Estate Client',
          ].map((quote, i) => (
            <span
              key={i}
              className="text-sm font-light italic shrink-0"
              style={{ color: i % 2 === 0 ? "rgba(201,169,110,0.7)" : "rgba(250,247,242,0.35)" }}
            >
              {quote}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section className="py-28 px-6" style={{ background: "#050E09" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
          >
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="section-line" />
              <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>Simple Process</span>
              <div className="section-line" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light" style={{ color: "#FAF7F2" }}>
              How We Work{" "}
              <span className="gold-text italic">Together.</span>
            </h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-4 gap-6 relative"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          >
            {[
              { step: "01", title: "Free Strategy Call", desc: "30 min. We listen, you talk. We map out exactly what your business needs." },
              { step: "02", title: "Custom Proposal", desc: "You get a clear plan — scope, timeline, investment. No surprises." },
              { step: "03", title: "We Build & Launch", desc: "Fast execution. You review, we refine. Live in weeks, not months." },
              { step: "04", title: "Grow Together", desc: "We track results, optimize, and scale what's working." },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                variants={fadeUp}
                className="relative flex flex-col gap-4 p-8"
                style={{
                  border: "1px solid rgba(201,169,110,0.12)",
                  background: "rgba(9,45,34,0.2)",
                }}
              >
                {i < 3 && (
                  <div
                    className="absolute top-10 right-0 translate-x-1/2 hidden md:block text-lg"
                    style={{ color: "rgba(201,169,110,0.3)", zIndex: 1 }}
                  >
                    →
                  </div>
                )}
                <span className="font-display text-5xl font-light" style={{ color: "rgba(201,169,110,0.15)" }}>
                  {s.step}
                </span>
                <h3 className="font-display text-xl font-medium" style={{ color: "#FAF7F2" }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}>
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="flex justify-center mt-12"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.6 }}
          >
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold px-10 py-4 text-xs tracking-[0.2em] uppercase"
            >
              Start With a Free Call →
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
