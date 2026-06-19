"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BOOKING_URL } from "@/lib/config";

function fadeUp(i = 0) {
  return {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, ease: "easeOut" as const, delay: i * 0.12 },
  };
}

export default function Hero() {
  const taglineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = taglineRef.current;
    if (!el) return;
    const words = ["Visibility.", "Revenue.", "Growth."];
    let idx = 0, charIdx = 0, deleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    function type() {
      const word = words[idx];
      if (!deleting) {
        el!.textContent = word.slice(0, charIdx + 1);
        charIdx++;
        if (charIdx === word.length) { deleting = true; timeout = setTimeout(type, 2200); return; }
      } else {
        el!.textContent = word.slice(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) { deleting = false; idx = (idx + 1) % words.length; }
      }
      timeout = setTimeout(type, deleting ? 55 : 85);
    }
    timeout = setTimeout(type, 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #092D22 0%, #050E09 65%)" }}
    >
      {/* ── Aurora blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="aurora-blob-1 absolute rounded-full"
          style={{
            width: "70vw", height: "70vw",
            top: "-20%", left: "-10%",
            background: "radial-gradient(ellipse, rgba(20,82,64,0.55) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="aurora-blob-2 absolute rounded-full"
          style={{
            width: "60vw", height: "60vw",
            top: "-15%", right: "-15%",
            background: "radial-gradient(ellipse, rgba(201,169,110,0.1) 0%, rgba(9,45,34,0.3) 40%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="aurora-blob-3 absolute rounded-full"
          style={{
            width: "50vw", height: "50vw",
            bottom: "5%", left: "20%",
            background: "radial-gradient(ellipse, rgba(13,63,46,0.5) 0%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />
      </div>

      {/* ── Grid ── */}
      <div className="absolute inset-0 pointer-events-none hero-grid" />

      {/* ── Gold radial top glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,169,110,0.1) 0%, transparent 65%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Tag */}
        <motion.div className="inline-flex items-center gap-3 mb-10" {...fadeUp(0)}>
          <div className="w-8 h-px gold-shimmer-line" />
          <span className="text-xs tracking-[0.4em] uppercase font-medium" style={{ color: "#C9A96E" }}>
            Premium Growth Infrastructure
          </span>
          <div className="w-8 h-px gold-shimmer-line" />
        </motion.div>

        {/* Headline */}
        <h1 className="font-display font-light leading-[1.05] mb-6">
          <motion.span className="block text-5xl md:text-7xl lg:text-8xl" style={{ color: "#FAF7F2" }} {...fadeUp(1)}>
            We Build Digital
          </motion.span>
          <motion.span className="block text-5xl md:text-7xl lg:text-8xl italic" style={{ color: "#FAF7F2" }} {...fadeUp(2)}>
            Infrastructure That
          </motion.span>
          <motion.span className="block text-5xl md:text-7xl lg:text-8xl" {...fadeUp(3)}>
            <span className="gold-text">Drives&nbsp;</span>
            <span
              ref={taglineRef}
              className="gold-text"
              style={{ borderRight: "2px solid #C9A96E", paddingRight: "4px" }}
            />
          </motion.span>
        </h1>

        {/* Subheadline */}
        <motion.p
          className="text-lg md:text-xl max-w-2xl mx-auto mt-8 leading-relaxed font-light"
          style={{ color: "rgba(250,247,242,0.6)" }}
          {...fadeUp(4)}
        >
          Premium websites, AI-powered applications, and business growth systems
          engineered for ambitious brands ready to dominate their market.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
          {...fadeUp(5)}
        >
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold px-10 py-4 text-sm tracking-[0.2em] uppercase w-full sm:w-auto text-center flex items-center justify-center gap-2.5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Book Strategy Call
          </a>
          <Link
            href="/work"
            className="btn-outline-gold px-10 py-4 text-sm tracking-[0.2em] uppercase w-full sm:w-auto text-center"
          >
            View Our Work
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 mt-20 pt-12"
          style={{ borderTop: "1px solid rgba(201,169,110,0.12)" }}
          {...fadeUp(6)}
        >
          {[
            { value: "50+", label: "Systems Built" },
            { value: "$2M+", label: "Revenue Generated" },
            { value: "100%", label: "Client Satisfaction" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl md:text-4xl font-semibold gold-text">{s.value}</div>
              <div className="text-xs tracking-[0.25em] uppercase mt-1" style={{ color: "rgba(250,247,242,0.45)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
      >
        <div className="w-px h-10 float-anim" style={{ background: "linear-gradient(to bottom, #C9A96E, transparent)" }} />
        <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(201,169,110,0.5)" }}>Scroll</span>
      </motion.div>
    </section>
  );
}
