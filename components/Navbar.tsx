"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

const links = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#portfolio" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? "rgba(5,14,9,0.92)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(201,169,110,0.1)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image
              src="/logo.svg"
              alt="Toss Enterprise"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <span className="font-display text-lg font-semibold tracking-widest gold-text uppercase">
              Toss
            </span>
            <span className="block text-[10px] tracking-[0.3em] text-gold-light uppercase" style={{ color: "#C9A96E", opacity: 0.7, marginTop: "-2px" }}>
              Enterprise
            </span>
          </div>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm tracking-widest uppercase transition-colors duration-300"
              style={{ color: "#FAF7F2", opacity: 0.7 }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#C9A96E"; (e.target as HTMLElement).style.opacity = "1"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#FAF7F2"; (e.target as HTMLElement).style.opacity = "0.7"; }}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="#contact"
            className="btn-gold px-6 py-2.5 text-sm tracking-widest uppercase rounded-none"
            style={{ letterSpacing: "0.15em" }}
          >
            Book a Call
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="block w-6 h-px transition-all duration-300" style={{ background: "#C9A96E", transform: menuOpen ? "rotate(45deg) translateY(5px)" : "none" }} />
          <span className="block w-6 h-px transition-all duration-300" style={{ background: "#C9A96E", opacity: menuOpen ? 0 : 1 }} />
          <span className="block w-6 h-px transition-all duration-300" style={{ background: "#C9A96E", transform: menuOpen ? "rotate(-45deg) translateY(-5px)" : "none" }} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className="md:hidden overflow-hidden transition-all duration-500"
        style={{
          maxHeight: menuOpen ? "400px" : "0",
          background: "rgba(5,14,9,0.98)",
          borderBottom: menuOpen ? "1px solid rgba(201,169,110,0.15)" : "none",
        }}
      >
        <div className="px-6 py-6 flex flex-col gap-6">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm tracking-widest uppercase font-display text-xl"
              style={{ color: "#FAF7F2" }}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className="btn-gold px-6 py-3 text-sm tracking-widest uppercase text-center mt-2"
            onClick={() => setMenuOpen(false)}
          >
            Book a Call
          </a>
        </div>
      </div>
    </nav>
  );
}
