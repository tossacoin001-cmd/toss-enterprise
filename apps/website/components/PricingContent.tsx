"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { BOOKING_URL } from "@/lib/config";

const tiers = [
  {
    name: "Quick Launch", price: "$799", naira: "~₦1.2M",
    tagline: "Your first digital impression, live in 3 days.",
    delivery: "3-day delivery", highlighted: false,
    features: ["Custom landing page design","Mobile-first responsive build","WhatsApp integration","Lead capture form","Google Analytics setup","Basic SEO setup","14-day post-launch support"],
    cta: "Get Started",
  },
  {
    name: "Starter", price: "$1,500", naira: "~₦2.25M",
    tagline: "A complete website that works while you sleep.",
    delivery: "7-day delivery", highlighted: false,
    features: ["Up to 5-page website","Mobile-first responsive build","Booking / enquiry system","WhatsApp automation","Google Business setup","Basic SEO foundation","Google Analytics","30-day support"],
    cta: "Start Now",
  },
  {
    name: "Growth", price: "$2,800", naira: "~₦4.2M",
    tagline: "Full business presence with automation.",
    delivery: "14-day delivery", highlighted: true,
    features: ["Multi-page website (up to 8 pages)","CRM integration & setup","WhatsApp automation sequences","Google Business + local SEO","Conversion funnel design","Lead capture & nurturing","Analytics dashboard","60-day support"],
    cta: "Most Popular — Start Now",
  },
  {
    name: "Premium", price: "$5,500", naira: "~₦8.25M",
    tagline: "A custom platform engineered for scale.",
    delivery: "21-day build", highlighted: false,
    features: ["Custom platform design","User authentication system","Admin dashboard","Payment integration","AI feature integration","API connections","Advanced analytics","90-day support"],
    cta: "Build My Platform",
  },
  {
    name: "Enterprise", price: "$10,000+", naira: "Custom",
    tagline: "Complete AI-powered business infrastructure.",
    delivery: "Bespoke timeline", highlighted: false,
    features: ["Everything in Premium","AI automation systems","Multi-platform integration","Dedicated build team","Priority 24/7 support","Monthly growth retainer","Quarterly strategy reviews","Custom SLA agreement"],
    cta: "Schedule a Call",
  },
];

const retainerFeatures = [
  { name: "Hosting & Deployment", desc: "Managed hosting on Vercel with 99.9% uptime and instant rollback." },
  { name: "Monthly SEO", desc: "On-page optimisation, keyword tracking, and ranking reports every month." },
  { name: "Visibility Management", desc: "Google Business and Maps optimisation, review monitoring and response." },
  { name: "Analytics Reporting", desc: "Clear monthly performance report with actionable growth recommendations." },
  { name: "Content Updates", desc: "Up to 4 content or design updates per month — no extra charge." },
  { name: "Priority Support", desc: "Fast-track response for any technical issues. You're never left waiting." },
];

function fadeUp(i = 0) {
  return {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: "easeOut" as const, delay: i * 0.08 },
  };
}

export default function PricingContent() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative pt-44 pb-24 px-6 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #092D22 0%, #050E09 100%)" }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="aurora-blob-1 absolute rounded-full" style={{
            width: "50vw", height: "50vw", top: "-15%", right: "-5%",
            background: "radial-gradient(ellipse, rgba(20,82,64,0.45) 0%, transparent 70%)",
            filter: "blur(70px)",
          }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div className="flex items-center gap-4 mb-8" {...fadeUp(0)}>
            <div className="section-line" />
            <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>Investment</span>
          </motion.div>
          <motion.h1 className="font-display text-6xl md:text-8xl font-light leading-[1.02] mb-6"
            style={{ color: "#FAF7F2" }} {...fadeUp(1)}>
            Transparent<br /><span className="gold-text italic">Pricing.</span>
          </motion.h1>
          <motion.p className="max-w-xl text-base leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }} {...fadeUp(2)}>
            Fixed-scope packages. No hourly billing. No surprise invoices. Prices in USD — accessible from Nigeria and globally. Naira estimates shown for reference.
          </motion.p>
        </div>
      </section>

      {/* ── Tiers ── */}
      <section className="px-6 pb-16" style={{ background: "#050E09" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {tiers.map((t, i) => (
              <motion.div key={t.name} className="flex flex-col relative"
                style={{
                  background: t.highlighted ? "linear-gradient(135deg, #0D4535, #0A3728)" : "rgba(9,45,34,0.3)",
                  border: t.highlighted ? "1px solid rgba(201,169,110,0.45)" : "1px solid rgba(201,169,110,0.1)",
                }}
                initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                {t.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs tracking-[0.2em] uppercase font-medium whitespace-nowrap"
                    style={{ background: "#C9A96E", color: "#092D22" }}>
                    Most Popular
                  </div>
                )}
                <div className="p-7 flex flex-col h-full">
                  <div className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#C9A96E" }}>{t.name}</div>
                  <div className="font-display text-3xl font-semibold mb-0.5" style={{ color: "#FAF7F2" }}>{t.price}</div>
                  <div className="text-xs mb-1" style={{ color: "rgba(201,169,110,0.5)" }}>{t.naira}</div>
                  <div className="text-xs mb-1" style={{ color: "rgba(250,247,242,0.45)" }}>{t.tagline}</div>
                  <div className="text-[10px] px-2 py-1 inline-block mb-5 mt-2 w-fit"
                    style={{ border: "1px solid rgba(201,169,110,0.15)", color: "rgba(201,169,110,0.6)" }}>
                    {t.delivery}
                  </div>
                  <div className="h-px mb-5" style={{ background: "rgba(201,169,110,0.1)" }} />
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2.5" className="mt-0.5 shrink-0">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="text-xs leading-relaxed" style={{ color: "rgba(250,247,242,0.6)" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer"
                    className={`block text-center py-3 text-xs tracking-[0.18em] uppercase transition-all duration-300 ${t.highlighted ? "btn-gold" : "btn-outline-gold"}`}>
                    {t.cta}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.p className="text-center text-xs mt-6" style={{ color: "rgba(250,247,242,0.3)" }} {...fadeUp(1)}>
            All prices in USD. Naira estimates based on current rates. Payments accepted via Flutterwave, Paystack, and bank transfer.
          </motion.p>
        </div>
      </section>

      {/* ── Retainer ── */}
      <section className="py-24 px-6" style={{ background: "#092D22", borderTop: "1px solid rgba(201,169,110,0.08)" }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <motion.div {...fadeUp(0)}>
            <div className="flex items-center gap-4 mb-6">
              <div className="section-line" />
              <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>Monthly Retainer</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light mb-6" style={{ color: "#FAF7F2" }}>
              Keep Growing<br /><span className="gold-text italic">After Launch.</span>
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: "rgba(250,247,242,0.55)" }}>
              A website without ongoing management loses ground every month. Our retainers keep your systems maintained, optimised, and growing.
            </p>
            <div className="font-display text-4xl gold-text font-semibold mb-1">$199 – $999</div>
            <div className="text-xs tracking-wider uppercase mb-1" style={{ color: "rgba(250,247,242,0.4)" }}>Per month — scope dependent</div>
            <div className="text-xs mb-8" style={{ color: "rgba(201,169,110,0.45)" }}>~₦300k – ₦1.5M/month</div>
            <Link href="/retainer" className="btn-gold inline-block px-8 py-3.5 text-xs tracking-[0.2em] uppercase">
              Build My Retainer Plan →
            </Link>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-3">
            {retainerFeatures.map((f, i) => (
              <motion.div key={f.name} className="p-6"
                style={{ border: "1px solid rgba(201,169,110,0.1)", background: "rgba(5,14,9,0.4)" }}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-3" style={{ background: "#C9A96E" }} />
                  <h3 className="text-sm font-medium" style={{ color: "#FAF7F2" }}>{f.name}</h3>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(250,247,242,0.45)" }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6" style={{ background: "#050E09" }}>
        <div className="max-w-4xl mx-auto">
          <motion.h2 className="font-display text-3xl font-light mb-12 text-center"
            style={{ color: "#FAF7F2" }} {...fadeUp(0)}>
            Common <span className="gold-text italic">Questions.</span>
          </motion.h2>
          <div className="space-y-4">
            {[
              { q: "Can I pay in Naira?", a: "Yes. We accept payments via Paystack and Flutterwave — both support NGN, USD, and other currencies. We'll agree on the exchange rate at time of invoice." },
              { q: "How do I get started?", a: "Book a free 30-minute strategy call. We'll scope your project, recommend the right package, and send a proposal within 24 hours." },
              { q: "What if I need something between tiers?", a: "Custom scopes are always available. Book a call and we'll price it exactly to what you need — no padding." },
              { q: "Do you work with clients outside Nigeria?", a: "Yes — we're remote-first and work with clients globally. All communication is async-friendly across time zones." },
            ].map((item, i) => (
              <motion.div key={item.q} className="p-6"
                style={{ border: "1px solid rgba(201,169,110,0.1)", background: "rgba(9,45,34,0.2)" }}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                <div className="text-sm font-medium mb-2" style={{ color: "#FAF7F2" }}>{item.q}</div>
                <div className="text-xs leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}>{item.a}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center" style={{ background: "#092D22", borderTop: "1px solid rgba(201,169,110,0.08)" }}>
        <div className="max-w-xl mx-auto">
          <motion.div {...fadeUp(0)}>
            <h2 className="font-display text-4xl md:text-5xl font-light mb-6" style={{ color: "#FAF7F2" }}>
              Not sure which <span className="gold-text italic">tier fits?</span>
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(250,247,242,0.5)" }}>
              Book a free strategy call. We'll recommend the right scope for your business and budget — no pressure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="btn-gold px-10 py-4 text-xs tracking-[0.2em] uppercase">
                Book Free Strategy Call
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
