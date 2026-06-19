"use client";
import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", business: "", email: "", service: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  const services = [
    "Visibility System",
    "Revenue Website",
    "AI Application",
    "Business Automation",
    "Full Growth Package",
  ];

  return (
    <section id="contact" className="py-32 px-6" style={{ background: "#050E09" }}>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20">
        {/* Left */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="section-line" />
            <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>
              Start Here
            </span>
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-light leading-[1.1] mb-8" style={{ color: "#FAF7F2" }}>
            Ready to Build
            <br />
            <span className="gold-text italic">Your System?</span>
          </h2>
          <p className="text-base leading-relaxed mb-12" style={{ color: "rgba(250,247,242,0.5)" }}>
            Book a free 30-minute strategy call. We'll diagnose exactly what your business needs and show you what the system will produce — before you invest a cent.
          </p>

          {/* Contact details */}
          <div className="space-y-6">
            {[
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                ),
                label: "WhatsApp",
                value: "+27 XX XXX XXXX",
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                ),
                label: "Email",
                value: "hello@tossEnterprise.com",
              },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-4">
                <div
                  className="w-10 h-10 flex items-center justify-center shrink-0"
                  style={{ border: "1px solid rgba(201,169,110,0.2)", color: "#C9A96E" }}
                >
                  {c.icon}
                </div>
                <div>
                  <div className="text-xs tracking-wider uppercase mb-0.5" style={{ color: "rgba(250,247,242,0.35)" }}>
                    {c.label}
                  </div>
                  <div className="text-sm" style={{ color: "#FAF7F2" }}>
                    {c.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div
          className="p-10"
          style={{ border: "1px solid rgba(201,169,110,0.15)", background: "rgba(9,45,34,0.3)" }}
        >
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-6 py-16">
              <div
                className="w-16 h-16 flex items-center justify-center"
                style={{ border: "1px solid #C9A96E" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="font-display text-3xl gold-text">Message Received</h3>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(250,247,242,0.55)" }}>
                We'll review your enquiry and reach out within 24 hours to schedule your strategy call.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="font-display text-2xl font-medium mb-8" style={{ color: "#FAF7F2" }}>
                Book Your Strategy Call
              </h3>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs tracking-wider uppercase mb-2" style={{ color: "rgba(250,247,242,0.45)" }}>
                    Your Name
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Smith"
                    className="w-full px-4 py-3 text-sm outline-none transition-all duration-300"
                    style={{
                      background: "rgba(5,14,9,0.6)",
                      border: "1px solid rgba(201,169,110,0.15)",
                      color: "#FAF7F2",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(201,169,110,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(201,169,110,0.15)")}
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-wider uppercase mb-2" style={{ color: "rgba(250,247,242,0.45)" }}>
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={form.business}
                    onChange={(e) => setForm({ ...form, business: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full px-4 py-3 text-sm outline-none transition-all duration-300"
                    style={{
                      background: "rgba(5,14,9,0.6)",
                      border: "1px solid rgba(201,169,110,0.15)",
                      color: "#FAF7F2",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(201,169,110,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(201,169,110,0.15)")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-wider uppercase mb-2" style={{ color: "rgba(250,247,242,0.45)" }}>
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 text-sm outline-none transition-all duration-300"
                  style={{
                    background: "rgba(5,14,9,0.6)",
                    border: "1px solid rgba(201,169,110,0.15)",
                    color: "#FAF7F2",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(201,169,110,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(201,169,110,0.15)")}
                />
              </div>

              <div>
                <label className="block text-xs tracking-wider uppercase mb-2" style={{ color: "rgba(250,247,242,0.45)" }}>
                  What Do You Need?
                </label>
                <select
                  value={form.service}
                  onChange={(e) => setForm({ ...form, service: e.target.value })}
                  className="w-full px-4 py-3 text-sm outline-none transition-all duration-300"
                  style={{
                    background: "rgba(5,14,9,0.6)",
                    border: "1px solid rgba(201,169,110,0.15)",
                    color: form.service ? "#FAF7F2" : "rgba(250,247,242,0.35)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(201,169,110,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(201,169,110,0.15)")}
                >
                  <option value="" disabled style={{ background: "#050E09" }}>
                    Select a service
                  </option>
                  {services.map((s) => (
                    <option key={s} value={s} style={{ background: "#050E09" }}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs tracking-wider uppercase mb-2" style={{ color: "rgba(250,247,242,0.45)" }}>
                  Tell Us About Your Business
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="What does your business do, and what's your biggest growth challenge right now?"
                  className="w-full px-4 py-3 text-sm outline-none resize-none transition-all duration-300"
                  style={{
                    background: "rgba(5,14,9,0.6)",
                    border: "1px solid rgba(201,169,110,0.15)",
                    color: "#FAF7F2",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(201,169,110,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(201,169,110,0.15)")}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gold py-4 text-sm tracking-[0.2em] uppercase mt-2 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-green-deep border-t-transparent rounded-full" />
                    Sending...
                  </>
                ) : (
                  "Book Strategy Call"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
