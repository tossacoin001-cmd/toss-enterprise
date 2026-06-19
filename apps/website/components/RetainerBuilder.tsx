"use client";
import { useState } from "react";
import Link from "next/link";
import { BOOKING_URL } from "@/lib/config";

const packages = [
  {
    id: "starter",
    name: "Starter",
    price: 300,
    tagline: "Keep the lights on.",
    description: "Essential maintenance and hosting for businesses that just need their site to stay live and healthy.",
    includes: [
      "Managed hosting (99.9% uptime)",
      "Monthly security updates",
      "Basic performance monitoring",
      "Monthly health report",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 700,
    tagline: "Stay visible and competitive.",
    description: "Everything in Starter plus active SEO management and Google visibility optimisation every month.",
    includes: [
      "Everything in Starter",
      "Monthly on-page SEO",
      "Google Business optimisation",
      "Review management",
      "4 content updates/month",
      "Keyword ranking report",
    ],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 1500,
    tagline: "Full growth management.",
    description: "Hands-off growth management. We run your digital presence end-to-end every month.",
    includes: [
      "Everything in Growth",
      "WhatsApp automation management",
      "Competitor monitoring",
      "Monthly strategy session",
      "Analytics dashboard",
      "Priority support (same-day)",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 2000,
    tagline: "Complete business infrastructure.",
    description: "Custom scope. Dedicated team. Full digital operations management for ambitious, growing businesses.",
    includes: [
      "Everything in Premium",
      "Dedicated account manager",
      "Custom integrations support",
      "AI automation management",
      "Quarterly strategy review",
      "Custom SLA agreement",
    ],
  },
];

const addons = [
  {
    id: "google-ads",
    name: "Google Ads Management",
    price: 300,
    desc: "Monthly campaign setup, optimisation, and reporting. Ad spend billed separately.",
  },
  {
    id: "social-content",
    name: "Social Media Content",
    price: 400,
    desc: "8 branded posts per month across 2 platforms, designed and scheduled.",
  },
  {
    id: "extra-content",
    name: "Extra Content Updates",
    price: 100,
    desc: "4 additional content or minor design changes per month (beyond package allocation).",
  },
  {
    id: "snapchat",
    name: "Snapchat Visibility",
    price: 150,
    desc: "Snapchat Map placement management and local audience optimisation.",
  },
  {
    id: "extra-call",
    name: "Monthly Strategy Call",
    price: 250,
    desc: "Extra dedicated 60-min strategy session each month with a senior team member.",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Broadcast Campaigns",
    price: 200,
    desc: "2 targeted broadcast campaigns per month to your contact list.",
  },
  {
    id: "email-marketing",
    name: "Email Marketing",
    price: 350,
    desc: "4 branded email campaigns per month — designed, written, and sent.",
  },
  {
    id: "ai-chatbot",
    name: "AI Chatbot Management",
    price: 500,
    desc: "Continuous training and optimisation of your AI assistant or lead bot.",
  },
];

export default function RetainerBuilder() {
  const [selectedPkg, setSelectedPkg] = useState<string>("growth");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const pkg = packages.find((p) => p.id === selectedPkg)!;
  const addonTotal = selectedAddons.reduce((sum, id) => {
    const addon = addons.find((a) => a.id === id);
    return sum + (addon?.price ?? 0);
  }, 0);
  const total = pkg.price + addonTotal;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const bookingParams = new URLSearchParams({
    pkg: pkg.name,
    addons: selectedAddons.join(","),
    total: String(total),
  });

  return (
    <section className="px-6 pb-20" style={{ background: "#050E09" }}>
      <div className="max-w-7xl mx-auto">

        {/* Step 1 — Choose Package */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div
              className="w-8 h-8 flex items-center justify-center font-display text-sm font-semibold shrink-0"
              style={{ border: "1px solid rgba(201,169,110,0.4)", color: "#C9A96E" }}
            >
              1
            </div>
            <h2 className="font-display text-2xl font-medium" style={{ color: "#FAF7F2" }}>
              Choose Your Base Package
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages.map((p) => {
              const active = selectedPkg === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPkg(p.id)}
                  className="relative text-left flex flex-col transition-all duration-300 focus:outline-none"
                  style={{
                    background: active
                      ? "linear-gradient(135deg, #0D4535, #0A3728)"
                      : "rgba(9,45,34,0.3)",
                    border: active
                      ? "1px solid rgba(201,169,110,0.5)"
                      : "1px solid rgba(201,169,110,0.1)",
                    transform: active ? "translateY(-2px)" : "none",
                  }}
                >
                  {p.popular && (
                    <div
                      className="absolute -top-3 left-4 px-3 py-0.5 text-xs tracking-[0.2em] uppercase font-medium"
                      style={{ background: "#C9A96E", color: "#092D22" }}
                    >
                      Popular
                    </div>
                  )}

                  <div className="p-7 flex flex-col h-full">
                    {/* Selected indicator */}
                    <div className="flex items-center justify-between mb-5">
                      <span
                        className="text-xs tracking-[0.25em] uppercase"
                        style={{ color: active ? "#C9A96E" : "rgba(201,169,110,0.5)" }}
                      >
                        {p.name}
                      </span>
                      <div
                        className="w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center"
                        style={{
                          border: "1px solid rgba(201,169,110,0.4)",
                          background: active ? "#C9A96E" : "transparent",
                        }}
                      >
                        {active && (
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#092D22" }} />
                        )}
                      </div>
                    </div>

                    <div
                      className="font-display text-3xl font-semibold mb-1"
                      style={{ color: "#FAF7F2" }}
                    >
                      ${p.price.toLocaleString()}
                      <span className="text-sm font-light ml-1" style={{ color: "rgba(250,247,242,0.4)" }}>
                        /mo
                      </span>
                    </div>
                    <div className="text-xs mb-4" style={{ color: "rgba(250,247,242,0.4)" }}>
                      {p.tagline}
                    </div>

                    <div className="h-px mb-5" style={{ background: "rgba(201,169,110,0.1)" }} />

                    <ul className="space-y-2.5 flex-1">
                      {p.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#C9A96E"
                            strokeWidth="2.5"
                            className="mt-0.5 shrink-0"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span
                            className="text-xs leading-relaxed text-left"
                            style={{ color: "rgba(250,247,242,0.6)" }}
                          >
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 — Add-ons */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div
              className="w-8 h-8 flex items-center justify-center font-display text-sm font-semibold shrink-0"
              style={{ border: "1px solid rgba(201,169,110,0.4)", color: "#C9A96E" }}
            >
              2
            </div>
            <h2 className="font-display text-2xl font-medium" style={{ color: "#FAF7F2" }}>
              Add Extra Services{" "}
              <span className="font-light text-lg" style={{ color: "rgba(250,247,242,0.35)" }}>
                — optional
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {addons.map((addon) => {
              const active = selectedAddons.includes(addon.id);
              return (
                <button
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className="text-left p-6 transition-all duration-300 focus:outline-none"
                  style={{
                    background: active ? "rgba(201,169,110,0.08)" : "rgba(9,45,34,0.2)",
                    border: active
                      ? "1px solid rgba(201,169,110,0.4)"
                      : "1px solid rgba(201,169,110,0.08)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3
                      className="text-sm font-medium leading-tight"
                      style={{ color: active ? "#FAF7F2" : "rgba(250,247,242,0.7)" }}
                    >
                      {addon.name}
                    </h3>
                    <div
                      className="w-5 h-5 flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{
                        border: "1px solid rgba(201,169,110,0.4)",
                        background: active ? "#C9A96E" : "transparent",
                      }}
                    >
                      {active && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#092D22" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: "rgba(250,247,242,0.4)" }}>
                    {addon.desc}
                  </p>
                  <div className="font-display text-lg font-medium" style={{ color: "#C9A96E" }}>
                    +${addon.price}
                    <span className="text-xs font-light ml-1" style={{ color: "rgba(250,247,242,0.35)" }}>
                      /mo
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3 — Summary */}
        <div
          className="p-8 md:p-10"
          style={{ border: "1px solid rgba(201,169,110,0.25)", background: "linear-gradient(135deg, #0D4535, #092D22)" }}
        >
          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-8 h-8 flex items-center justify-center font-display text-sm font-semibold shrink-0"
                  style={{ border: "1px solid rgba(201,169,110,0.4)", color: "#C9A96E" }}
                >
                  3
                </div>
                <h2 className="font-display text-2xl font-medium" style={{ color: "#FAF7F2" }}>
                  Your Plan Summary
                </h2>
              </div>

              {/* Package line */}
              <div
                className="flex justify-between items-center py-3"
                style={{ borderBottom: "1px solid rgba(201,169,110,0.1)" }}
              >
                <span className="text-sm" style={{ color: "rgba(250,247,242,0.7)" }}>
                  {pkg.name} Package
                </span>
                <span className="font-display text-lg" style={{ color: "#FAF7F2" }}>
                  ${pkg.price.toLocaleString()}/mo
                </span>
              </div>

              {/* Add-on lines */}
              {selectedAddons.length > 0 && (
                <div style={{ borderBottom: "1px solid rgba(201,169,110,0.1)" }}>
                  {selectedAddons.map((id) => {
                    const addon = addons.find((a) => a.id === id)!;
                    return (
                      <div key={id} className="flex justify-between items-center py-2.5">
                        <span className="text-sm" style={{ color: "rgba(250,247,242,0.55)" }}>
                          + {addon.name}
                        </span>
                        <span className="text-sm" style={{ color: "rgba(250,247,242,0.7)" }}>
                          ${addon.price}/mo
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center pt-5">
                <span
                  className="text-xs tracking-[0.25em] uppercase"
                  style={{ color: "rgba(250,247,242,0.5)" }}
                >
                  Total Monthly Investment
                </span>
                <div className="text-right">
                  <div className="font-display text-4xl font-semibold gold-text">
                    ${total.toLocaleString()}
                  </div>
                  <div
                    className="text-xs tracking-wider uppercase"
                    style={{ color: "rgba(250,247,242,0.35)" }}
                  >
                    per month
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-4 md:min-w-[220px]">
              <a
                href={`${BOOKING_URL}?${bookingParams}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold px-8 py-4 text-xs tracking-[0.2em] uppercase text-center flex items-center justify-center gap-3"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Book a Call to Confirm
              </a>
              <Link
                href="/contact"
                className="btn-outline-gold px-8 py-3.5 text-xs tracking-[0.2em] uppercase text-center"
              >
                Send as Enquiry Instead
              </Link>
              <p className="text-xs text-center" style={{ color: "rgba(250,247,242,0.3)" }}>
                No payment now. We'll confirm scope on the call.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
