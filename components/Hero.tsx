"use client";
import { useEffect, useRef } from "react";

export default function Hero() {
  const taglineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = taglineRef.current;
    if (!el) return;
    const words = ["Visibility.", "Revenue.", "Growth."];
    let idx = 0;
    let charIdx = 0;
    let deleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    function type() {
      const word = words[idx];
      if (!deleting) {
        el!.textContent = word.slice(0, charIdx + 1);
        charIdx++;
        if (charIdx === word.length) {
          deleting = true;
          timeout = setTimeout(type, 2200);
          return;
        }
      } else {
        el!.textContent = word.slice(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) {
          deleting = false;
          idx = (idx + 1) % words.length;
        }
      }
      timeout = setTimeout(type, deleting ? 60 : 90);
    }

    timeout = setTimeout(type, 800);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #092D22 0%, #050E09 60%)" }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,169,110,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(201,169,110,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Tag */}
        <div className="inline-flex items-center gap-3 mb-10">
          <div className="w-8 h-px" style={{ background: "#C9A96E" }} />
          <span
            className="text-xs tracking-[0.4em] uppercase font-medium"
            style={{ color: "#C9A96E" }}
          >
            Premium Growth Infrastructure
          </span>
          <div className="w-8 h-px" style={{ background: "#C9A96E" }} />
        </div>

        {/* Headline */}
        <h1 className="font-display font-light leading-[1.05] mb-6">
          <span
            className="block text-5xl md:text-7xl lg:text-8xl"
            style={{ color: "#FAF7F2" }}
          >
            We Build Digital
          </span>
          <span
            className="block text-5xl md:text-7xl lg:text-8xl italic"
            style={{ color: "#FAF7F2" }}
          >
            Infrastructure That
          </span>
          <span className="block text-5xl md:text-7xl lg:text-8xl">
            <span className="gold-text">Drives&nbsp;</span>
            <span
              ref={taglineRef}
              className="gold-text inline-block min-w-[4ch]"
              style={{ borderRight: "2px solid #C9A96E", paddingRight: "4px" }}
            />
          </span>
        </h1>

        {/* Sub */}
        <p
          className="text-lg md:text-xl max-w-2xl mx-auto mt-8 leading-relaxed font-light"
          style={{ color: "rgba(250,247,242,0.6)" }}
        >
          Premium websites, AI-powered applications, and business growth systems
          engineered for ambitious brands ready to dominate their market.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <a
            href="#contact"
            className="btn-gold px-10 py-4 text-sm tracking-[0.2em] uppercase w-full sm:w-auto text-center"
          >
            Book Strategy Call
          </a>
          <a
            href="#portfolio"
            className="btn-outline-gold px-10 py-4 text-sm tracking-[0.2em] uppercase w-full sm:w-auto text-center"
          >
            View Our Work
          </a>
        </div>

        {/* Stats row */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 mt-20 pt-12"
          style={{ borderTop: "1px solid rgba(201,169,110,0.12)" }}
        >
          {[
            { value: "50+", label: "Systems Built" },
            { value: "$2M+", label: "Revenue Generated" },
            { value: "100%", label: "Client Satisfaction" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl md:text-4xl font-semibold gold-text">
                {s.value}
              </div>
              <div
                className="text-xs tracking-[0.25em] uppercase mt-1"
                style={{ color: "rgba(250,247,242,0.45)" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-px h-10" style={{ background: "linear-gradient(to bottom, #C9A96E, transparent)" }} />
        <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(201,169,110,0.5)" }}>
          Scroll
        </span>
      </div>
    </section>
  );
}
