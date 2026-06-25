"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { BOOKING_URL } from "@/lib/config";

const categories = ["All", "Revenue Website", "AI Application", "SaaS Platform"];

type Project = {
  id: string;
  number: string;
  client: string;
  location: string;
  category: string;
  status: "live" | "coming-soon";
  headline: string;
  tagline: string;
  description: string;
  deliverables: string[];
  results: { value: string; label: string }[];
  tags: string[];
  accentColor: string;
  url?: string;
  teaser?: string;
};

const projects: Project[] = [
  {
    id: "julie-luxury-spa",
    number: "01",
    client: "Julie Luxury Spa",
    location: "Lagos, Nigeria",
    category: "Revenue Website",
    status: "live",
    headline: "Luxury Spa Platform Built to Convert & Automate",
    tagline: "Where luxury meets conversion.",
    description:
      "Julie's spa had the talent, the reputation, and the clientele — but the website was leaving money on the table every single day. We rebuilt the entire digital experience: a premium booking platform that feels as luxurious as walking through their doors, automated WhatsApp follow-ups that respond to every lead within minutes, and a conversion funnel engineered around one outcome — booked appointments.",
    deliverables: [
      "Premium luxury website design",
      "Real-time booking & scheduling",
      "WhatsApp lead follow-up automation",
      "Lead capture & CRM pipeline",
      "Mobile-first, conversion-engineered",
    ],
    results: [
      { value: "3×", label: "More Inquiries" },
      { value: "< 30 days", label: "To See Results" },
      { value: "100%", label: "Follow-ups Automated" },
    ],
    tags: ["Revenue Website", "Booking System", "WhatsApp API", "Lead Capture", "Next.js"],
    accentColor: "rgba(201,169,110,0.1)",
    url: "https://julie-luxury-spa.vercel.app/",
  },
  {
    id: "oj-clothings",
    number: "02",
    client: "OJ Clothings",
    location: "Lekki, Lagos",
    category: "Revenue Website",
    status: "live",
    headline: "Heritage Fashion E-Commerce for the Modern Nigerian Man",
    tagline: "Heritage, tailored for the digital age.",
    description:
      "OJ Clothings carries one of Lagos's most refined collections of native wear — agbada, jalabia, kaftans, and bespoke suits. The brand needed a digital presence that matched the premium of the product. We built a luxury e-commerce experience with occasion-based shopping, a made-to-measure booking system, and a WhatsApp chatbot concierge that handles enquiries around the clock.",
    deliverables: [
      "Luxury fashion e-commerce platform",
      "Collections: agbada, jalabia, kaftans, suits",
      "Occasion-based shopping (weddings, Eid, owambe)",
      "Made-to-measure booking system",
      "WhatsApp chatbot concierge",
    ],
    results: [
      { value: "5+", label: "Collections Live" },
      { value: "24/7", label: "WhatsApp Concierge" },
      { value: "Bespoke", label: "MTM System" },
    ],
    tags: ["Revenue Website", "Fashion E-Commerce", "WhatsApp Bot", "Made-to-Measure", "Next.js"],
    accentColor: "rgba(13,63,46,0.2)",
    url: "https://oj-clothings-repo.vercel.app/",
  },
  {
    id: "shopkyluxury",
    number: "03",
    client: "Shopkyluxury",
    location: "Lagos & New York",
    category: "Revenue Website",
    status: "live",
    headline: "Global Luxury Womenswear Platform — Lagos to New York",
    tagline: "Dress like you own the room.",
    description:
      "Founded in New York in 2015 and now anchored in Lekki, Shopkyluxury is one of West Africa's most distinctive luxury womenswear brands. We built a platform that matches the editorial confidence of the brand — curated collections, a private styling consultation system via WhatsApp, an Inner Circle membership for VIP access, and worldwide shipping infrastructure that serves a global clientele.",
    deliverables: [
      "Luxury womenswear e-commerce platform",
      "Editorial-grade design & photography layout",
      "WhatsApp private styling consultation flow",
      "Inner Circle VIP membership & early access",
      "Worldwide shipping & logistics integration",
    ],
    results: [
      { value: "Global", label: "Worldwide Shipping" },
      { value: "VIP", label: "Inner Circle System" },
      { value: "$250+", label: "Average Order Value" },
    ],
    tags: ["Revenue Website", "Luxury E-Commerce", "Womenswear", "WhatsApp Styling", "Global Shipping"],
    accentColor: "rgba(201,169,110,0.07)",
    url: "https://shopluxury-site.vercel.app/",
  },
  {
    id: "dyneinroots",
    number: "04",
    client: "DyneInRoots",
    location: "Lekki, Lagos",
    category: "Revenue Website",
    status: "live",
    headline: "Authentic Nigerian Restaurant Platform with WhatsApp Ordering",
    tagline: "Rooted in tradition, growing in flavour.",
    description:
      "DyneInRoots serves some of Lagos's most authentic Nigerian cuisine — jollof rice, traditional soups, and premium proteins cooked fresh in small batches daily. They needed a digital home that matched the warmth and depth of the food. We built a clean, appetising platform with a full digital menu, WhatsApp ordering integration, and a dine-in, pickup, and delivery flow that works across Glovo.",
    deliverables: [
      "Restaurant website with full digital menu",
      "WhatsApp ordering system integration",
      "Dine-in, pickup & delivery flow",
      "Glovo partnership integration",
      "Menu sections: breakfast, soups, mains, proteins",
    ],
    results: [
      { value: "3", label: "Order Channels" },
      { value: "10am–10pm", label: "Always Open Online" },
      { value: "Fresh", label: "Daily Menu System" },
    ],
    tags: ["Revenue Website", "Restaurant Platform", "WhatsApp Ordering", "Food Delivery", "Glovo"],
    accentColor: "rgba(20,82,64,0.18)",
    url: "https://dyne-in-roots.vercel.app/",
  },
  {
    id: "rookas",
    number: "05",
    client: "ROOKAS Soccer Academy",
    location: "Richmond, Texas",
    category: "Revenue Website",
    status: "live",
    headline: "Youth Soccer Academy Platform with Enrollment & Programs",
    tagline: "Building the next generation, one season at a time.",
    description:
      "ROOKAS is a youth soccer academy in Richmond, Texas — four age-tiered programs for children from 2 to 10 years old, built around skills, community, and confidence. We built a warm, family-focused platform that makes enrollment effortless for parents: age-group program showcases, gear package details, coach profiles, and a clear CTA that converts visits into sign-ups for their founding season.",
    deliverables: [
      "Academy website with program showcases",
      "Age-tiered program pages (Tiny Tots → Academy)",
      "Enrollment & gear package system",
      "Parent-facing UX & coach profiles",
      "Brand identity: navy & gold visual system",
    ],
    results: [
      { value: "4", label: "Age Programs" },
      { value: "2–10", label: "Years Served" },
      { value: "2026", label: "Founding Season" },
    ],
    tags: ["Revenue Website", "Academy Platform", "Youth Sports", "Enrollment System", "Texas"],
    accentColor: "rgba(9,45,34,0.25)",
    url: "https://rookas.vercel.app/",
  },
  {
    id: "lux-catalog",
    number: "06",
    client: "Lux Catalog",
    location: "Global",
    category: "AI Application",
    status: "coming-soon",
    headline: "The Definitive Luxury Asset Discovery Platform",
    tagline: "Every luxury asset. One destination.",
    description:
      "Lux Catalog is being built as the single destination for discovering and acquiring the world's finest assets — prime real estate, supercars, superyachts, bespoke interior decor, commercial properties, and everything that defines the luxury lifestyle. An AI-powered recommendation engine matches buyers to their perfect assets before they even know they want them.",
    deliverables: [
      "AI-powered luxury asset matching engine",
      "Prime real estate & commercial RE catalogue",
      "Supercars, yachts & lifestyle collections",
      "Premium editorial-grade UX design",
      "Personalised discovery & acquisition flow",
    ],
    results: [
      { value: "AI", label: "Powered Matching" },
      { value: "6+", label: "Asset Categories" },
      { value: "Global", label: "Luxury Network" },
    ],
    tags: ["AI Application", "Luxury Platform", "Real Estate", "Lifestyle", "Discovery Engine"],
    accentColor: "rgba(201,169,110,0.05)",
    teaser: "Curated luxury assets — discovered, desired, acquired.",
  },
  {
    id: "toss-visibility-os",
    number: "07",
    client: "Toss Visibility OS",
    location: "Global SaaS",
    category: "SaaS Platform",
    status: "live",
    headline: "The Operating System for Business Visibility",
    tagline: "Own your presence. Everywhere.",
    description:
      "Toss Visibility OS is our flagship SaaS product — a multi-tenant platform that gives local businesses full command of their online presence from one dashboard. Google Business management, AI-generated review responses, competitor tracking, local SEO monitoring, and a social content engine — all automated, all working while you sleep.",
    deliverables: [
      "Multi-tenant SaaS architecture",
      "Google Business management suite",
      "AI-powered review response engine",
      "Competitor visibility tracking",
      "Automated social content generation",
    ],
    results: [
      { value: "MRR", label: "Recurring Revenue" },
      { value: "Multi", label: "Tenant Platform" },
      { value: "AI", label: "Content Engine" },
    ],
    tags: ["SaaS Platform", "Local SEO", "AI Automation", "Google Business", "Multi-tenant"],
    accentColor: "rgba(20,82,64,0.18)",
    url: "https://visibility-os-jade.vercel.app/",
  },
];

function fadeUp(i = 0) {
  return {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.75, ease: "easeOut" as const, delay: i * 0.1 },
  };
}

export default function WorkContent() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  const liveCount = projects.filter((p) => p.status === "live").length;

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-44 pb-24 px-6 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #092D22 0%, #050E09 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="aurora-blob-1 absolute rounded-full"
            style={{
              width: "55vw", height: "55vw",
              top: "-20%", right: "-10%",
              background: "radial-gradient(ellipse, rgba(20,82,64,0.5) 0%, transparent 70%)",
              filter: "blur(70px)",
            }}
          />
          <div
            className="aurora-blob-2 absolute rounded-full"
            style={{
              width: "40vw", height: "40vw",
              bottom: "0%", left: "-5%",
              background: "radial-gradient(ellipse, rgba(201,169,110,0.07) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div className="flex items-center gap-4 mb-8" {...fadeUp(0)}>
            <div className="section-line" />
            <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>
              Our Portfolio
            </span>
          </motion.div>

          <motion.h1
            className="font-display text-6xl md:text-8xl font-light leading-[1.02] mb-6"
            style={{ color: "#FAF7F2" }}
            {...fadeUp(1)}
          >
            Real Work.
            <br />
            <span className="gold-text italic">Real Results.</span>
          </motion.h1>

          <motion.p
            className="max-w-lg text-base leading-relaxed mb-10"
            style={{ color: "rgba(250,247,242,0.5)" }}
            {...fadeUp(2)}
          >
            {liveCount} live systems across fashion, food, luxury, sports, and beyond —
            engineered to perform from day one. Plus two more in the build.
          </motion.p>

          {/* Stats strip */}
          <motion.div
            className="flex flex-wrap gap-8 mb-12 pb-12"
            style={{ borderBottom: "1px solid rgba(201,169,110,0.1)" }}
            {...fadeUp(3)}
          >
            {[
              { value: `${liveCount}`, label: "Live Builds" },
              { value: "2", label: "In Development" },
              { value: "4", label: "Countries Served" },
              { value: "100%", label: "Client Retention" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl font-semibold gold-text">{s.value}</div>
                <div className="text-xs tracking-[0.25em] uppercase mt-1" style={{ color: "rgba(250,247,242,0.35)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Category filter */}
          <motion.div className="flex flex-wrap gap-3" {...fadeUp(4)}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="relative text-xs tracking-[0.2em] uppercase px-5 py-2.5 transition-all duration-300"
                style={{
                  border: `1px solid ${activeCategory === cat ? "rgba(201,169,110,0.5)" : "rgba(201,169,110,0.15)"}`,
                  color: activeCategory === cat ? "#C9A96E" : "rgba(250,247,242,0.4)",
                  background: activeCategory === cat ? "rgba(201,169,110,0.08)" : "transparent",
                }}
              >
                {cat}
                {activeCategory === cat && (
                  <motion.div
                    layoutId="filterBar"
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: "#C9A96E" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Projects ──────────────────────────────────────────────────────── */}
      <section className="px-6 pb-32" style={{ background: "#050E09" }}>
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5 pt-6"
            >
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.08 }}
                >
                  {p.status === "live" ? (
                    <LiveCard project={p} />
                  ) : (
                    <ComingSoonCard project={p} />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section
        className="py-28 px-6 text-center relative overflow-hidden"
        style={{ background: "#092D22", borderTop: "1px solid rgba(201,169,110,0.08)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(201,169,110,0.07) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="section-line" />
              <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>Your Turn</span>
              <div className="section-line" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light mb-5" style={{ color: "#FAF7F2" }}>
              Ready to be{" "}
              <span className="gold-text italic">next?</span>
            </h2>
            <p className="text-sm leading-relaxed mb-10" style={{ color: "rgba(250,247,242,0.5)" }}>
              Let's build a system that belongs in this portfolio. Free strategy call — no pitch deck, just a real conversation about your growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold px-10 py-4 text-xs tracking-[0.2em] uppercase"
              >
                Book Free Strategy Call
              </a>
              <Link href="/services" className="btn-outline-gold px-10 py-4 text-xs tracking-[0.2em] uppercase">
                See Our Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

/* ── Live Project Card ─────────────────────────────────────────────────── */
function LiveCard({ project: p }: { project: Project }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        border: "1px solid rgba(201,169,110,0.18)",
        background: "linear-gradient(135deg, rgba(9,45,34,0.35) 0%, rgba(5,14,9,0.85) 100%)",
      }}
    >
      {/* Live badge */}
      <div
        className="absolute top-6 right-6 z-10 flex items-center gap-2 px-3 py-1.5"
        style={{ background: "rgba(9,45,34,0.8)", border: "1px solid rgba(201,169,110,0.3)" }}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ background: "#C9A96E" }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#C9A96E" }} />
        </span>
        <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#C9A96E" }}>Live</span>
      </div>

      {/* Accent glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: p.accentColor, filter: "blur(80px)" }}
      />

      <div className="relative z-10 p-8 md:p-12 lg:p-14">
        {/* Header */}
        <div className="flex items-start gap-6 mb-10">
          <span
            className="font-display text-5xl font-light shrink-0 hidden md:block"
            style={{ color: "rgba(201,169,110,0.12)" }}
          >
            {p.number}
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className="text-xs tracking-[0.2em] uppercase px-3 py-1"
                style={{ border: "1px solid rgba(201,169,110,0.3)", color: "#C9A96E" }}
              >
                {p.category}
              </span>
              <span className="text-xs" style={{ color: "rgba(250,247,242,0.35)" }}>{p.client}</span>
              <span className="text-xs" style={{ color: "rgba(250,247,242,0.2)" }}>· {p.location}</span>
            </div>
            <h2 className="font-display text-2xl md:text-4xl font-medium mb-3" style={{ color: "#FAF7F2" }}>
              {p.headline}
            </h2>
            <p className="text-sm italic" style={{ color: "rgba(201,169,110,0.65)" }}>{p.tagline}</p>
          </div>
        </div>

        {/* Body grid */}
        <div className="grid lg:grid-cols-[1fr_200px] gap-10">
          <div>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(250,247,242,0.58)" }}>
              {p.description}
            </p>

            <div className="mb-8">
              <p className="text-[10px] tracking-[0.35em] uppercase mb-4"
                style={{ color: "rgba(201,169,110,0.45)" }}>What We Built</p>
              <div className="grid sm:grid-cols-2 gap-y-2 gap-x-6">
                {p.deliverables.map((d) => (
                  <div key={d} className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full shrink-0 mt-1.5" style={{ background: "#C9A96E" }} />
                    <span className="text-xs leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span key={t} className="text-[10px] px-3 py-1 tracking-wide"
                  style={{
                    background: "rgba(201,169,110,0.04)",
                    border: "1px solid rgba(201,169,110,0.1)",
                    color: "rgba(201,169,110,0.5)",
                  }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Results column */}
          <div className="flex lg:flex-col gap-3">
            {p.results.map((r) => (
              <div key={r.label} className="flex-1 text-center p-4 lg:p-5"
                style={{
                  border: "1px solid rgba(201,169,110,0.14)",
                  background: "rgba(201,169,110,0.04)",
                }}>
                <div className="font-display text-xl md:text-2xl font-semibold gold-text">{r.value}</div>
                <div className="text-[10px] tracking-wider uppercase mt-1"
                  style={{ color: "rgba(250,247,242,0.3)" }}>{r.label}</div>
              </div>
            ))}
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 text-[10px] tracking-[0.25em] uppercase transition-all duration-300"
                style={{
                  border: "1px solid rgba(201,169,110,0.2)",
                  color: "rgba(201,169,110,0.6)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,169,110,0.5)";
                  (e.currentTarget as HTMLElement).style.color = "#C9A96E";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,169,110,0.2)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(201,169,110,0.6)";
                }}
              >
                View Site
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Coming Soon Card ──────────────────────────────────────────────────── */
function ComingSoonCard({ project: p }: { project: Project }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        border: "1px solid rgba(201,169,110,0.08)",
        background: "rgba(5,14,9,0.92)",
      }}
    >
      {/* In Development badge */}
      <div
        className="absolute top-6 right-6 z-10 flex items-center gap-2 px-3 py-1.5"
        style={{ background: "rgba(5,14,9,0.95)", border: "1px solid rgba(201,169,110,0.15)" }}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40"
            style={{ background: "rgba(201,169,110,0.5)" }} />
          <span className="relative inline-flex rounded-full h-2 w-2"
            style={{ background: "rgba(201,169,110,0.35)" }} />
        </span>
        <span className="text-[10px] tracking-[0.3em] uppercase"
          style={{ color: "rgba(201,169,110,0.5)" }}>In Development</span>
      </div>

      {/* Vertical watermark */}
      <div className="absolute right-16 top-0 bottom-0 items-center pointer-events-none select-none hidden lg:flex">
        <span
          className="font-display text-[11px] tracking-[0.5em] uppercase"
          style={{
            color: "rgba(201,169,110,0.04)",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
          }}
        >
          Coming Soon
        </span>
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: p.accentColor, filter: "blur(100px)" }}
      />

      <div className="relative z-10 p-8 md:p-12 lg:p-14">
        <div className="flex items-start gap-6 mb-8">
          <span className="font-display text-5xl font-light shrink-0 hidden md:block"
            style={{ color: "rgba(201,169,110,0.06)" }}>
            {p.number}
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs tracking-[0.2em] uppercase px-3 py-1"
                style={{ border: "1px solid rgba(201,169,110,0.12)", color: "rgba(201,169,110,0.5)" }}>
                {p.category}
              </span>
              <span className="text-xs" style={{ color: "rgba(250,247,242,0.2)" }}>{p.client}</span>
              <span className="text-xs" style={{ color: "rgba(250,247,242,0.15)" }}>· {p.location}</span>
            </div>
            <h2 className="font-display text-2xl md:text-4xl font-medium mb-3"
              style={{ color: "rgba(250,247,242,0.6)" }}>
              {p.headline}
            </h2>
            <p className="text-sm italic" style={{ color: "rgba(201,169,110,0.45)" }}>{p.tagline}</p>
          </div>
        </div>

        {p.teaser && (
          <div className="mb-8 px-5 py-4 border-l-2" style={{ borderColor: "rgba(201,169,110,0.15)" }}>
            <p className="text-sm italic" style={{ color: "rgba(201,169,110,0.45)" }}>{p.teaser}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_200px] gap-10">
          <div>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(250,247,242,0.35)" }}>
              {p.description}
            </p>

            <div className="mb-8">
              <p className="text-[10px] tracking-[0.35em] uppercase mb-4"
                style={{ color: "rgba(201,169,110,0.25)" }}>Scope Preview</p>
              <div className="grid sm:grid-cols-2 gap-y-2 gap-x-6">
                {p.deliverables.map((d) => (
                  <div key={d} className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full shrink-0 mt-1.5"
                      style={{ background: "rgba(201,169,110,0.25)" }} />
                    <span className="text-xs leading-relaxed"
                      style={{ color: "rgba(250,247,242,0.3)" }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span key={t} className="text-[10px] px-3 py-1 tracking-wide"
                  style={{
                    border: "1px solid rgba(201,169,110,0.06)",
                    color: "rgba(201,169,110,0.25)",
                  }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex lg:flex-col gap-3">
            {p.results.map((r) => (
              <div key={r.label} className="flex-1 text-center p-4 lg:p-5"
                style={{
                  border: "1px solid rgba(201,169,110,0.06)",
                  background: "rgba(201,169,110,0.02)",
                }}>
                <div className="font-display text-xl md:text-2xl font-semibold"
                  style={{ color: "rgba(201,169,110,0.28)" }}>{r.value}</div>
                <div className="text-[10px] tracking-wider uppercase mt-1"
                  style={{ color: "rgba(250,247,242,0.18)" }}>{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
