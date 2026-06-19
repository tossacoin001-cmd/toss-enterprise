"use client";
import { motion } from "framer-motion";
import { BOOKING_URL, WHATSAPP_URL } from "@/lib/config";

const steps = [
  {
    number: "01", title: "Strategy Call", duration: "30 minutes",
    description: "We start with a free 30-minute call where we listen — not pitch. We want to understand your business model, your customers, your current bottlenecks, and where you want to be in 12 months.",
    outcomes: ["Clear diagnosis of your biggest growth gap","Recommended system to build first","Honest scope and investment estimate","No obligation — you own everything discussed"],
  },
  {
    number: "02", title: "System Design", duration: "3–5 days",
    description: "Once we're aligned, we map out your system in full before we write a single line of code. This includes the tech stack, user flows, integrations, and a realistic delivery timeline.",
    outcomes: ["Full system architecture document","User flow and wireframe review","Technology and integration plan","Signed scope and timeline agreement"],
  },
  {
    number: "03", title: "Build & Iterate", duration: "7–30 days",
    description: "We build fast and in the open. You get weekly progress updates, live previews, and the ability to review and give feedback at every stage — no surprises at the end.",
    outcomes: ["Weekly progress check-ins","Live preview links throughout the build","Your feedback shapes every iteration","30-day post-launch performance guarantee"],
  },
  {
    number: "04", title: "Launch & Grow", duration: "Ongoing",
    description: "Launch day is not the finish line. After deployment, we offer ongoing visibility management, SEO, analytics, and optimization retainers — so your system keeps compounding in value.",
    outcomes: ["Full handover with documentation","Optional monthly growth retainer","SEO and visibility management","Analytics and performance reporting"],
  },
];

const faqs = [
  { q: "How long does a build typically take?", a: "Landing pages and simple sites: 3–7 days. Business websites: 1–2 weeks. Custom applications and platforms: 3–6 weeks. We'll give you a precise timeline during the strategy call." },
  { q: "Do I need to provide content?", a: "We prefer to work with your existing content and brand assets where possible. We can also provide copywriting and content strategy as an add-on if needed." },
  { q: "What happens after launch?", a: "Every client gets a 30-day support window post-launch. After that, we offer monthly retainers covering hosting, SEO, visibility management, and ongoing optimization." },
  { q: "Can you work with our existing website?", a: "Yes — we can rebuild, redesign, or extend an existing site. We'll assess your current setup during the strategy call and recommend the most efficient path forward." },
  { q: "Do you work with international clients?", a: "Absolutely. We work with clients globally from Nigeria. All communication, deliverables, and support are handled remotely across time zones." },
];

export default function ProcessContent() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative pt-44 pb-24 px-6 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #092D22 0%, #050E09 100%)" }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="aurora-blob-3 absolute rounded-full" style={{
            width: "50vw", height: "50vw", top: "-10%", right: "-10%",
            background: "radial-gradient(ellipse, rgba(20,82,64,0.4) 0%, transparent 70%)",
            filter: "blur(70px)",
          }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div className="flex items-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="section-line" />
            <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>How We Work</span>
          </motion.div>
          <motion.h1 className="font-display text-6xl md:text-8xl font-light leading-[1.02] mb-6" style={{ color: "#FAF7F2" }}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
            From Strategy<br /><span className="gold-text italic">To Revenue.</span>
          </motion.h1>
          <motion.p className="max-w-xl text-base leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            A proven four-step process that takes you from a business challenge to a live, revenue-generating system.
          </motion.p>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="px-6 pb-28" style={{ background: "#050E09" }}>
        <div className="max-w-5xl mx-auto space-y-3">
          {steps.map((s, i) => (
            <motion.div key={s.number}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.06 }}
              style={{ border: "1px solid rgba(201,169,110,0.1)", background: "rgba(9,45,34,0.2)" }}>
              <div className="p-10 md:p-14 grid md:grid-cols-[160px_1fr] gap-10 items-start">
                <div>
                  <motion.div className="font-display text-7xl font-light leading-none mb-3"
                    style={{ color: "rgba(201,169,110,0.2)" }}
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                    viewport={{ once: true }} transition={{ duration: 1, delay: 0.15 }}>
                    {s.number}
                  </motion.div>
                  <div className="text-xs tracking-[0.2em] uppercase px-3 py-1.5 inline-block"
                    style={{ border: "1px solid rgba(201,169,110,0.2)", color: "#C9A96E" }}>
                    {s.duration}
                  </div>
                </div>
                <div>
                  <h2 className="font-display text-4xl font-medium mb-5" style={{ color: "#FAF7F2" }}>{s.title}</h2>
                  <p className="text-base leading-relaxed mb-8" style={{ color: "rgba(250,247,242,0.55)" }}>{s.description}</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {s.outcomes.map((o, oi) => (
                      <motion.div key={o} className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.4, delay: oi * 0.07 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2.5" className="mt-0.5 shrink-0">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="text-sm" style={{ color: "rgba(250,247,242,0.65)" }}>{o}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex justify-center" style={{ borderTop: "1px solid rgba(201,169,110,0.06)" }}>
                  <div className="w-px h-6" style={{ background: "linear-gradient(to bottom, rgba(201,169,110,0.3), transparent)" }} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="py-28 px-6" style={{ background: "#092D22", borderTop: "1px solid rgba(201,169,110,0.08)" }}>
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="section-line" />
              <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>FAQs</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light mb-12" style={{ color: "#FAF7F2" }}>
              Common <span className="gold-text italic">Questions.</span>
            </h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <motion.div key={f.q} className="p-8"
                style={{ border: "1px solid rgba(201,169,110,0.1)", background: "rgba(5,14,9,0.4)" }}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }}>
                <h3 className="text-base font-medium mb-4" style={{ color: "#FAF7F2" }}>{f.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(250,247,242,0.55)" }}>{f.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center" style={{ background: "#050E09" }}>
        <div className="max-w-xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <h2 className="font-display text-4xl md:text-5xl font-light mb-6" style={{ color: "#FAF7F2" }}>
              Ready to start <span className="gold-text italic">Step 01?</span>
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(250,247,242,0.5)" }}>
              Book your free strategy call. No pitch. Just a clear-eyed look at your business and what it needs to grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="btn-gold px-10 py-4 text-xs tracking-[0.2em] uppercase">
                Book Strategy Call
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-outline-gold px-10 py-4 text-xs tracking-[0.2em] uppercase">
                Chat on WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
