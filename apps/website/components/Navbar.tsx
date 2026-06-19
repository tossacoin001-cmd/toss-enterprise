"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BOOKING_URL } from "@/lib/config";

const links = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "Products", href: "/products", highlight: true },
  { label: "Process", href: "/process" },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(5,14,9,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(201,169,110,0.1)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 shrink-0">
            <Image
              src="/logo-mark.png"
              alt="Toss Enterprise"
              fill
              className="object-contain transition-opacity duration-300 group-hover:opacity-90"
              priority
            />
          </div>
          <div className="flex flex-col leading-none">
            <span
              className="font-display text-base font-semibold tracking-[0.25em] uppercase gold-text"
            >
              TOSS
            </span>
            <span
              className="text-[9px] tracking-[0.35em] uppercase font-light"
              style={{ color: "rgba(201,169,110,0.6)", marginTop: "1px" }}
            >
              ENTERPRISE
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => {
            const active = pathname === l.href;
            if (l.highlight) {
              return (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-xs tracking-[0.2em] uppercase px-4 py-1.5 transition-all duration-300"
                  style={{
                    border: "1px solid rgba(201,169,110,0.45)",
                    color: active ? "#092D22" : "#C9A96E",
                    background: active ? "#C9A96E" : "rgba(201,169,110,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#C9A96E";
                    (e.currentTarget as HTMLElement).style.color = "#092D22";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = active ? "#C9A96E" : "rgba(201,169,110,0.06)";
                    (e.currentTarget as HTMLElement).style.color = active ? "#092D22" : "#C9A96E";
                  }}
                >
                  {l.label}
                </Link>
              );
            }
            return (
              <Link
                key={l.label}
                href={l.href}
                className="text-xs tracking-[0.25em] uppercase transition-colors duration-300"
                style={{ color: active ? "#C9A96E" : "rgba(250,247,242,0.6)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#C9A96E")}
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = active ? "#C9A96E" : "rgba(250,247,242,0.6)")
                }
              >
                {l.label}
                {active && (
                  <span className="block mt-0.5 h-px" style={{ background: "#C9A96E" }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="hidden md:flex">
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold px-7 py-2.5 text-xs tracking-[0.2em] uppercase flex items-center gap-2"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Book a Call
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className="block w-6 h-px transition-all duration-300"
            style={{
              background: "#C9A96E",
              transform: menuOpen ? "rotate(45deg) translateY(5px)" : "none",
            }}
          />
          <span
            className="block w-6 h-px transition-all duration-300"
            style={{ background: "#C9A96E", opacity: menuOpen ? 0 : 1 }}
          />
          <span
            className="block w-6 h-px transition-all duration-300"
            style={{
              background: "#C9A96E",
              transform: menuOpen ? "rotate(-45deg) translateY(-5px)" : "none",
            }}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className="md:hidden overflow-hidden transition-all duration-500"
        style={{
          maxHeight: menuOpen ? "400px" : "0",
          background: "rgba(5,14,9,0.98)",
          borderBottom: menuOpen ? "1px solid rgba(201,169,110,0.12)" : "none",
        }}
      >
        <div className="px-6 py-8 flex flex-col gap-6">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="font-display text-2xl tracking-wide"
              style={{ color: l.highlight || pathname === l.href ? "#C9A96E" : "#FAF7F2" }}
            >
              {l.label}
            </Link>
          ))}
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold px-6 py-3 text-xs tracking-[0.2em] uppercase text-center mt-2"
          >
            Book a Call
          </a>
        </div>
      </div>
    </nav>
  );
}
