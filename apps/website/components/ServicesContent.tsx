"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { BOOKING_URL } from "@/lib/config";

const services = [
  {
    id: "visibility", number: "01", title: "Visibility Systems",
    tagline: "Be found before your competitors.",
    description: "Most businesses are invisible online — even great ones. We engineer multi-channel visibility systems that put your brand at the top of Google, on local maps, and in front of buyers actively searching for what you offer.",
    items: [
      { name: "Google Business Setup", desc: "Full profile optimisation, category mapping, and photo strategy to dominate local search." },
      { name: "Google Maps Ranking", desc: "Citation building, review generation, and proximity signals to rank higher on Google Maps." },
      { name: "Local SEO", desc: "On-page and off-page optimisation targeting the exact searches your customers make." },
      { name: "Snapchat Map Placement", desc: "Business placement on Snapchat Maps for maximum exposure to a younger, mobile-first audience." },
    ],
    result: "Average client sees 3× more calls within 60 days.", cta: "Get Visible",
  },
  {
    id: "websites", number: "02", title: "Revenue Websites",
    tagline: "Built to convert, not just look good.",
    description: "A beautiful website that doesn't convert is an expensive decoration. Every site we build has a clear conversion architecture — moving visitors through a deliberate journey that ends with them taking action.",
    items: [
      { name: "Luxury Website Design", desc: "Premium design that commands respect and positions your brand at the top of your market." },
      { name: "Conversion Funnels", desc: "Multi-step sequences designed to capture, qualify, and convert leads automatically." },
      { name: "Booking Systems", desc: "Real-time appointment booking integrated directly into your site and calendar." },
      { name: "Lead Capture", desc: "Forms, popups, and lead magnets that grow your database even when you're offline." },
    ],
    result: "Clients average 40% more leads in the first 30 days.", cta: "Build My Website",
  },
  {
    id: "ai", number: "03", title: "AI Applications",
    tagline: "Custom software that thinks.",
    description: "We build AI-powered tools your business actually uses — not demos. From customer portals to internal dashboards, every application is engineered around your exact workflow and team.",
    items: [
      { name: "Customer Portals", desc: "Branded portals where clients can manage their account, orders, and communication." },
      { name: "Internal Tools", desc: "Custom dashboards and admin systems that replace manual spreadsheet-based work." },
      { name: "AI Assistants", desc: "Chatbots and AI agents trained on your business that handle enquiries 24/7." },
      { name: "Lead Management Systems", desc: "End-to-end pipeline management from first contact to closed deal." },
    ],
    result: "Save 10+ hours per week with automated workflows.", cta: "Build My App",
  },
  {
    id: "automation", number: "04", title: "Business Automation",
    tagline: "Grow without growing headcount.",
    description: "Every manual task your team repeats daily is a candidate for automation. We map your workflows and systematically replace human labour with intelligent automation that runs 24/7.",
    items: [
      { name: "CRM Setup", desc: "Full CRM implementation with pipelines, automations, and team onboarding." },
      { name: "WhatsApp Automation", desc: "Automated follow-ups, broadcasts, and customer service via WhatsApp Business API." },
      { name: "Lead Follow-up Sequences", desc: "Multi-touch email and message sequences that nurture leads until they're ready to buy." },
      { name: "AI Workflows", desc: "n8n and Zapier workflows that connect your tools and eliminate manual data entry." },
    ],
    result: "Automate 60–80% of your follow-up process.", cta: "Automate My Business",
  },
];

export default function ServicesContent() {
  return (
    <>
      <section className="relative pt-44 pb-24 px-6 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #092D22 0%, #050E09 100%)" }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="aurora-blob-2 absolute rounded-full" style={{
            width: "55vw", height: "55vw", top: "-20%", left: "-10%",
            background: "radial-gradient(ellipse, rgba(20,82,64,0.45) 0%, transparent 70%)",
            filter: "blur(70px)",
          }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div className="flex items-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="section-line" />
            <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>Services</span>
          </motion.div>
          <motion.h1 className="font-display text-6xl md:text-8xl font-light leading-[1.02] mb-6" style={{ color: "#FAF7F2" }}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
            What We<br /><span className="gold-text italic">Build.</span>
          </motion.h1>
          <motion.p className="max-w-xl text-base leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            Four integrated systems. Each one engineered to solve a specific business problem and compound in value over time.
          </motion.p>
        </div>
      </section>

      <section className="px-6 pb-28" style={{ background: "#050E09" }}>
        <div className="max-w-7xl mx-auto space-y-4">
          {services.map((s, idx) => (
            <motion.div key={s.id} id={s.id}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.75, ease: "easeOut", delay: idx * 0.05 }}
              style={{ border: "1px solid rgba(201,169,110,0.12)", background: "rgba(9,45,34,0.2)" }}>
              <div className="p-10 md:p-14 grid md:grid-cols-[100px_1fr] gap-8 items-start">
                <div className="font-display text-6xl font-light leading-none" style={{ color: "rgba(201,169,110,0.15)" }}>
                  {s.number}
                </div>
                <div>
                  <span className="text-xs tracking-[0.3em] uppercase mb-3 block" style={{ color: "#C9A96E" }}>{s.tagline}</span>
                  <h2 className="font-display text-4xl md:text-5xl font-medium mb-6" style={{ color: "#FAF7F2" }}>{s.title}</h2>
                  <p className="text-base leading-relaxed max-w-2xl mb-10" style={{ color: "rgba(250,247,242,0.55)" }}>{s.description}</p>
                  <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    {s.items.map((item, i) => (
                      <motion.div key={item.name} className="p-6"
                        style={{ border: "1px solid rgba(201,169,110,0.1)", background: "rgba(5,14,9,0.5)" }}
                        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                        whileHover={{ borderColor: "rgba(201,169,110,0.25)", transition: { duration: 0.2 } }}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-1 h-4 shrink-0" style={{ background: "#C9A96E" }} />
                          <h3 className="text-sm font-medium" style={{ color: "#FAF7F2" }}>{item.name}</h3>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: "rgba(250,247,242,0.45)" }}>{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="px-4 py-3 text-xs tracking-wide mb-8 inline-block"
                    style={{ border: "1px solid rgba(201,169,110,0.2)", background: "rgba(201,169,110,0.05)", color: "#C9A96E" }}>
                    ✦ {s.result}
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <Link href="/pricing"
                      className="btn-gold inline-block px-8 py-3 text-xs tracking-[0.2em] uppercase">{s.cta} →</Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 text-center" style={{ background: "#092D22", borderTop: "1px solid rgba(201,169,110,0.08)" }}>
        <div className="max-w-xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <h2 className="font-display text-4xl md:text-5xl font-light mb-6" style={{ color: "#FAF7F2" }}>
              Not sure which system <span className="gold-text italic">you need?</span>
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(250,247,242,0.5)" }}>
              Book a free strategy call. We'll diagnose your biggest growth gap and recommend exactly what to build first.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="btn-gold px-10 py-4 text-xs tracking-[0.2em] uppercase">Book Free Strategy Call</a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
