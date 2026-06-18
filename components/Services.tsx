"use client";
import { useRef, useEffect } from "react";

const services = [
  {
    number: "01",
    title: "Visibility Systems",
    description:
      "Dominate local and digital search. We engineer Google Business setups, Maps ranking strategies, Snapchat map placement, and local SEO that puts your brand where customers are looking.",
    items: ["Google Business Setup", "Google Maps Ranking", "Local SEO", "Snapchat Visibility"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Revenue Websites",
    description:
      "Not just beautiful — built to convert. Every pixel engineered to move visitors through a journey that ends with them becoming customers, leads, or bookings.",
    items: ["Luxury Website Design", "Conversion Funnels", "Landing Pages", "Booking Systems"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "AI Applications",
    description:
      "Custom software powered by artificial intelligence. Internal tools, customer portals, lead management systems, and automation platforms built for your exact workflow.",
    items: ["Internal Tools", "Customer Portals", "Lead Management", "AI Assistants"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8m-4-4v4" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Business Automation",
    description:
      "Replace manual processes with intelligent systems. CRM setup, WhatsApp automation, lead follow-up sequences, and AI assistants that work 24/7 so you don't have to.",
    items: ["CRM Setup", "WhatsApp Automation", "Lead Follow-up Systems", "AI Workflows"],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll(".service-card");
    if (!cards) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" className="py-32 px-6" style={{ background: "#050E09" }} ref={sectionRef}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-20 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="section-line" />
            <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>
              What We Build
            </span>
          </div>
          <h2
            className="font-display text-5xl md:text-6xl font-light leading-[1.1]"
            style={{ color: "#FAF7F2" }}
          >
            Four Systems.
            <br />
            <span className="gold-text italic">One Mission.</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}>
            Every system we build is engineered around a single outcome: growing your business. No decorative work. Only infrastructure that performs.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s, i) => (
            <div
              key={s.number}
              className="service-card green-card p-10 transition-all duration-700 cursor-default group"
              style={{
                opacity: 0,
                transform: "translateY(32px)",
                transitionDelay: `${i * 120}ms`,
              }}
            >
              {/* Number + Icon */}
              <div className="flex items-start justify-between mb-8">
                <span
                  className="font-display text-6xl font-light leading-none"
                  style={{ color: "rgba(201,169,110,0.15)" }}
                >
                  {s.number}
                </span>
                <div style={{ color: "#C9A96E" }}>{s.icon}</div>
              </div>

              {/* Title */}
              <h3
                className="font-display text-3xl font-medium mb-4 group-hover:gold-text transition-all duration-300"
                style={{ color: "#FAF7F2" }}
              >
                {s.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(250,247,242,0.55)" }}>
                {s.description}
              </p>

              {/* Items */}
              <div className="flex flex-wrap gap-2">
                {s.items.map((item) => (
                  <span
                    key={item}
                    className="text-xs tracking-wider px-3 py-1.5 uppercase"
                    style={{
                      border: "1px solid rgba(201,169,110,0.2)",
                      color: "rgba(201,169,110,0.7)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
