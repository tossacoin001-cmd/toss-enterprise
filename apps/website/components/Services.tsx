"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const services = [
  {
    number: "01",
    title: "Visibility Systems",
    tagline: "Be found everywhere that matters.",
    description:
      "Most businesses are invisible online — even great ones. We change that. Google Maps, local SEO, and Snapchat placement that puts you exactly where your customers are already looking.",
    items: ["Google Business Setup", "Google Maps Ranking", "Local SEO", "Snapchat Visibility"],
    result: "Average client sees 3× more calls within 90 days.",
    color: "rgba(20,82,64,0.4)",
    icon: (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        <path d="M11 7v4l2 2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    number: "02",
    title: "Revenue Websites",
    tagline: "A site that sells while you sleep.",
    description:
      "Your website should be your best salesperson — working 24/7, never calling in sick. We build high-converting sites engineered around one thing: turning visitors into buyers.",
    items: ["Luxury Website Design", "Conversion Funnels", "Landing Pages", "Booking Systems"],
    result: "Clients average 40% more leads in the first month.",
    color: "rgba(9,45,34,0.6)",
    icon: (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
  {
    number: "03",
    title: "AI Applications",
    tagline: "Custom tools that give you an unfair edge.",
    description:
      "AI isn't just for big corporations anymore. We build custom portals, dashboards, and smart tools tailored to your exact workflow — so you move faster than every competitor in your space.",
    items: ["Internal Tools", "Customer Portals", "Lead Management", "AI Assistants"],
    result: "Save 10+ hours per week with automated workflows.",
    color: "rgba(201,169,110,0.08)",
    icon: (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>
        <path d="M7 8h.01M12 8h.01M17 8h.01" strokeLinecap="round" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    number: "04",
    title: "Business Automation",
    tagline: "Work smarter. Grow faster. Sleep better.",
    description:
      "Stop doing manually what a machine can do for you. CRM setups, WhatsApp follow-ups, lead nurturing sequences, and AI workflows that run your business processes on autopilot.",
    items: ["CRM Setup", "WhatsApp Automation", "Lead Follow-up", "AI Workflows"],
    result: "Automate 60–80% of your follow-up process.",
    color: "rgba(13,63,46,0.5)",
    icon: (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
    ),
  },
];

export default function Services() {
  const [active, setActive] = useState(0);
  const svc = services[active];

  return (
    <section id="services" className="py-32 px-6" style={{ background: "#050E09" }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          className="mb-20 max-w-2xl"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" as const }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="section-line" />
            <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>What We Build</span>
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-light leading-[1.1]" style={{ color: "#FAF7F2" }}>
            Four Systems.<br />
            <span className="gold-text italic">One Mission.</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}>
            Every system we build has one job: grow your business. Click each one to see exactly what's inside.
          </p>
        </motion.div>

        {/* Interactive layout */}
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6 lg:gap-12">

          {/* Left — Tab list */}
          <div className="flex flex-col gap-3">
            {services.map((s, i) => (
              <motion.button
                key={s.number}
                onClick={() => setActive(i)}
                className="text-left p-6 transition-all duration-300 relative overflow-hidden group"
                style={{
                  background: active === i ? "linear-gradient(135deg, #0D3F2E 0%, #092D22 100%)" : "transparent",
                  border: `1px solid ${active === i ? "rgba(201,169,110,0.35)" : "rgba(201,169,110,0.1)"}`,
                }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                {/* Active left bar */}
                {active === i && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-0.5"
                    style={{ background: "#C9A96E" }}
                    layoutId="activeBar"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span
                      className="font-display text-2xl font-light"
                      style={{ color: active === i ? "rgba(201,169,110,0.5)" : "rgba(201,169,110,0.15)" }}
                    >
                      {s.number}
                    </span>
                    <div>
                      <div
                        className="font-display text-xl md:text-2xl font-medium transition-colors duration-200"
                        style={{ color: active === i ? "#FAF7F2" : "rgba(250,247,242,0.5)" }}
                      >
                        {s.title}
                      </div>
                      <div
                        className="text-xs mt-0.5 transition-all duration-300"
                        style={{
                          color: active === i ? "rgba(201,169,110,0.8)" : "rgba(250,247,242,0.25)",
                          maxHeight: active === i ? "20px" : "0",
                          overflow: "hidden",
                        }}
                      >
                        {s.tagline}
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-xs transition-all duration-300"
                    style={{ color: active === i ? "#C9A96E" : "rgba(250,247,242,0.15)" }}
                  >
                    →
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Right — Detail panel */}
          <div className="relative min-h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="green-card p-10 h-full"
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
                transition={{ duration: 0.45, ease: "easeOut" as const }}
                style={{ borderColor: "rgba(201,169,110,0.25)" }}
              >
                {/* Bg accent */}
                <div
                  className="absolute inset-0 rounded pointer-events-none"
                  style={{ background: svc.color, filter: "blur(60px)", opacity: 0.5 }}
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-8" style={{ color: "#C9A96E" }}>
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, ease: "backOut" }}
                    >
                      {svc.icon}
                    </motion.div>
                  </div>

                  {/* Title + tagline */}
                  <div className="mb-6">
                    <h3 className="font-display text-3xl md:text-4xl font-medium mb-2" style={{ color: "#FAF7F2" }}>
                      {svc.title}
                    </h3>
                    <p className="text-sm font-medium tracking-wide" style={{ color: "#C9A96E" }}>
                      {svc.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-sm md:text-base leading-relaxed mb-8" style={{ color: "rgba(250,247,242,0.65)" }}>
                    {svc.description}
                  </p>

                  {/* Items grid */}
                  <div className="grid grid-cols-2 gap-2 mb-8">
                    {svc.items.map((item, i) => (
                      <motion.div
                        key={item}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.07, duration: 0.3 }}
                      >
                        <div className="w-1 h-1 rounded-full shrink-0" style={{ background: "#C9A96E" }} />
                        <span className="text-xs tracking-wide" style={{ color: "rgba(250,247,242,0.6)" }}>{item}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Result callout */}
                  <div
                    className="px-4 py-3 text-xs tracking-wide"
                    style={{
                      border: "1px solid rgba(201,169,110,0.25)",
                      background: "rgba(201,169,110,0.06)",
                      color: "#C9A96E",
                    }}
                  >
                    ✦ {svc.result}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Link
            href="/services"
            className="btn-outline-gold px-10 py-3.5 text-xs tracking-[0.2em] uppercase"
          >
            Explore All Services →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
