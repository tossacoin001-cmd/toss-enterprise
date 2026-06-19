"use client";
import { useState } from "react";

const services = [
  "Visibility System",
  "Revenue Website",
  "AI Application",
  "Business Automation",
  "Full Growth Package",
];

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    business: "",
    email: "",
    service: "",
    budget: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  const inputStyle = {
    background: "rgba(5,14,9,0.7)",
    border: "1px solid rgba(201,169,110,0.15)",
    color: "#FAF7F2",
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "rgba(201,169,110,0.5)";
    e.target.style.outline = "none";
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "rgba(201,169,110,0.15)";
  };

  if (submitted) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center gap-6 py-24"
        style={{ border: "1px solid rgba(201,169,110,0.15)", background: "rgba(9,45,34,0.3)" }}
      >
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
    );
  }

  return (
    <div
      className="p-10 md:p-12"
      style={{ border: "1px solid rgba(201,169,110,0.15)", background: "rgba(9,45,34,0.3)" }}
    >
      <h2 className="font-display text-2xl font-medium mb-8" style={{ color: "#FAF7F2" }}>
        Book Your Strategy Call
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs tracking-wider uppercase mb-2" style={{ color: "rgba(250,247,242,0.4)" }}>
              Your Name *
            </label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Smith"
              className="w-full px-4 py-3 text-sm"
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
          <div>
            <label className="block text-xs tracking-wider uppercase mb-2" style={{ color: "rgba(250,247,242,0.4)" }}>
              Business Name
            </label>
            <input
              type="text"
              value={form.business}
              onChange={(e) => setForm({ ...form, business: e.target.value })}
              placeholder="Acme Corp"
              className="w-full px-4 py-3 text-sm"
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs tracking-wider uppercase mb-2" style={{ color: "rgba(250,247,242,0.4)" }}>
            Email Address *
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@company.com"
            className="w-full px-4 py-3 text-sm"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs tracking-wider uppercase mb-2" style={{ color: "rgba(250,247,242,0.4)" }}>
              What Do You Need?
            </label>
            <select
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              className="w-full px-4 py-3 text-sm"
              style={{ ...inputStyle, color: form.service ? "#FAF7F2" : "rgba(250,247,242,0.35)" }}
              onFocus={focusStyle}
              onBlur={blurStyle}
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
            <label className="block text-xs tracking-wider uppercase mb-2" style={{ color: "rgba(250,247,242,0.4)" }}>
              Budget Range
            </label>
            <select
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              className="w-full px-4 py-3 text-sm"
              style={{ ...inputStyle, color: form.budget ? "#FAF7F2" : "rgba(250,247,242,0.35)" }}
              onFocus={focusStyle}
              onBlur={blurStyle}
            >
              <option value="" disabled style={{ background: "#050E09" }}>
                Select budget
              </option>
              {["$1,000 – $2,500", "$2,500 – $5,000", "$5,000 – $10,000", "$10,000+"].map((b) => (
                <option key={b} value={b} style={{ background: "#050E09" }}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs tracking-wider uppercase mb-2" style={{ color: "rgba(250,247,242,0.4)" }}>
            Tell Us About Your Business
          </label>
          <textarea
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="What does your business do, and what's your biggest growth challenge right now?"
            className="w-full px-4 py-3 text-sm resize-none"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-gold py-4 text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 mt-2"
        >
          {loading ? (
            <>
              <span
                className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: "#092D22", borderTopColor: "transparent" }}
              />
              Sending...
            </>
          ) : (
            "Book Strategy Call →"
          )}
        </button>
      </form>
    </div>
  );
}
