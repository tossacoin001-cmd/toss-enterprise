import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { WHATSAPP_URL, EMAIL, ADDRESS, BOOKING_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Book a Strategy Call — Toss Enterprise",
  description: "Book a free 30-minute strategy call with Toss Enterprise. We'll map out exactly what your business needs to grow — before you invest a cent.",
};

export default function ContactPage() {
  return (
    <>
      <section
        className="pt-40 pb-20 px-6"
        style={{ background: "linear-gradient(180deg, #092D22 0%, #050E09 100%)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="section-line" />
            <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>Book a Call</span>
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-light leading-[1.05] mb-6" style={{ color: "#FAF7F2" }}>
            Let&apos;s Build<br /><span className="gold-text italic">Your System.</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}>
            Free 30-minute strategy call. We'll map out exactly what your business needs and what it will produce — before you invest a cent.
          </p>
        </div>
      </section>

      <section className="px-6 pb-28" style={{ background: "#050E09" }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.5fr] gap-16 items-start">
          {/* Left */}
          <div className="pt-4">
            <h2 className="font-display text-3xl font-light mb-8" style={{ color: "#FAF7F2" }}>What to expect</h2>
            <div className="space-y-6 mb-12">
              {[
                { step: "01", title: "You send your details", desc: "Fill in the form. The more context you give, the more useful the call." },
                { step: "02", title: "We review and reach out", desc: "We'll respond within 24 hours to schedule a time that works for you." },
                { step: "03", title: "30-minute strategy call", desc: "We diagnose your growth gap, recommend a system, and give you an honest scope." },
                { step: "04", title: "You decide — no pressure", desc: "Everything discussed is yours. No obligation to continue." },
              ].map((item) => (
                <div key={item.step} className="flex gap-5">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0 font-display text-sm"
                    style={{ border: "1px solid rgba(201,169,110,0.25)", color: "#C9A96E" }}>
                    {item.step}
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1" style={{ color: "#FAF7F2" }}>{item.title}</div>
                    <div className="text-xs leading-relaxed" style={{ color: "rgba(250,247,242,0.45)" }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Direct contacts */}
            <div className="space-y-4 pt-8" style={{ borderTop: "1px solid rgba(201,169,110,0.08)" }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: "rgba(250,247,242,0.35)" }}>
                Or reach out directly
              </div>
              {[
                {
                  label: "WhatsApp",
                  value: "+234 808 791 9951",
                  href: WHATSAPP_URL,
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  ),
                },
                {
                  label: "Email",
                  value: EMAIL,
                  href: `mailto:${EMAIL}`,
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  ),
                },
                {
                  label: "Location",
                  value: ADDRESS,
                  href: null,
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  ),
                },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-4">
                  <div className="w-9 h-9 flex items-center justify-center shrink-0"
                    style={{ border: "1px solid rgba(201,169,110,0.18)", color: "#C9A96E" }}>
                    {c.icon}
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "rgba(250,247,242,0.3)" }}>{c.label}</div>
                    {c.href ? (
                      <a href={c.href} target="_blank" rel="noopener noreferrer"
                        className="text-sm transition-colors duration-200 text-[#FAF7F2] hover:text-[#C9A96E]"
                      >{c.value}</a>
                    ) : (
                      <div className="text-sm" style={{ color: "#FAF7F2" }}>{c.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Calendly direct */}
            <div className="mt-8">
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold inline-flex items-center gap-2 px-8 py-3.5 text-xs tracking-[0.2em] uppercase"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Book via Calendly
              </a>
            </div>
          </div>

          {/* Right — Form */}
          <ContactForm />
        </div>
      </section>
    </>
  );
}
