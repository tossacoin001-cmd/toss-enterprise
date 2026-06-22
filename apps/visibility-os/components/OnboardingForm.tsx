"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ChevronRight, Building2, MapPin, Link, AtSign } from "lucide-react";

const CATEGORIES = [
  "Restaurant / Food & Beverage",
  "Salon & Beauty",
  "Spa & Wellness",
  "Clinic / Healthcare",
  "Real Estate",
  "Retail Store",
  "Event Planning",
  "Education / Training",
  "Fashion & Clothing",
  "Technology",
  "Consulting",
  "Other",
];

const steps = [
  { id: 1, label: "Business Name", icon: Building2 },
  { id: 2, label: "Category", icon: Building2 },
  { id: 3, label: "Location", icon: MapPin },
  { id: 4, label: "Online Presence", icon: Link },
];

export default function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    city: "",
    country: "NG",
    googleBizUrl: "",
    phoneNumber: "",
    website: "",
    instagramHandle: "",
  });

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setError("");
  }

  function canProceed() {
    if (step === 1) return form.name.trim().length >= 2;
    if (step === 2) return form.category.length > 0;
    if (step === 3) return form.city.trim().length >= 2;
    return true;
  }

  function next() {
    if (!canProceed()) return;
    if (step < steps.length) {
      setStep((s) => s + 1);
    } else {
      submit();
    }
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong");
      }
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 1800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <motion.div
        className="text-center py-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="w-16 h-16 mx-auto mb-6 flex items-center justify-center"
          style={{ border: "1px solid rgba(74,222,128,0.3)", background: "rgba(74,222,128,0.05)" }}
        >
          <CheckCircle size={28} style={{ color: "#4ade80" }} />
        </div>
        <h3 className="font-display text-2xl font-light mb-2" style={{ color: "#FAF7F2" }}>
          Business connected!
        </h3>
        <p className="text-sm" style={{ color: "rgba(250,247,242,0.5)" }}>
          Taking you to your dashboard…
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Step progress */}
      <div className="flex items-center gap-0 mb-10">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div
              className="w-7 h-7 flex items-center justify-center text-xs shrink-0 transition-colors duration-300"
              style={{
                background: step > s.id ? "#C9A96E" : step === s.id ? "rgba(201,169,110,0.15)" : "rgba(9,45,34,0.3)",
                border: step >= s.id ? "1px solid #C9A96E" : "1px solid rgba(201,169,110,0.15)",
                color: step > s.id ? "#092D22" : step === s.id ? "#C9A96E" : "rgba(250,247,242,0.3)",
                fontWeight: 600,
              }}
            >
              {step > s.id ? "✓" : s.id}
            </div>
            <div className="text-[10px] ml-2 tracking-wide hidden sm:block" style={{
              color: step >= s.id ? "rgba(250,247,242,0.6)" : "rgba(250,247,242,0.25)"
            }}>
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-px mx-3"
                style={{ background: step > s.id ? "rgba(201,169,110,0.4)" : "rgba(201,169,110,0.1)" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
        >
          {step === 1 && (
            <div>
              <h2 className="font-display text-3xl font-light mb-2" style={{ color: "#FAF7F2" }}>
                What&apos;s your business called?
              </h2>
              <p className="text-sm mb-8" style={{ color: "rgba(250,247,242,0.5)" }}>
                Enter the name exactly as it appears on Google.
              </p>
              <input
                className="input-field text-base"
                placeholder="e.g. Lagos Grill House"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && next()}
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-display text-3xl font-light mb-2" style={{ color: "#FAF7F2" }}>
                What type of business?
              </h2>
              <p className="text-sm mb-6" style={{ color: "rgba(250,247,242,0.5)" }}>
                This helps us tailor your visibility strategy.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => update("category", cat)}
                    className="p-3 text-left text-xs transition-all duration-200"
                    style={{
                      background: form.category === cat ? "rgba(201,169,110,0.12)" : "rgba(9,45,34,0.2)",
                      border: form.category === cat ? "1px solid #C9A96E" : "1px solid rgba(201,169,110,0.08)",
                      color: form.category === cat ? "#C9A96E" : "rgba(250,247,242,0.6)",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-display text-3xl font-light mb-2" style={{ color: "#FAF7F2" }}>
                Where are you located?
              </h2>
              <p className="text-sm mb-8" style={{ color: "rgba(250,247,242,0.5)" }}>
                Your city helps us check local search visibility.
              </p>
              <div className="space-y-3">
                <input
                  className="input-field"
                  placeholder="City (e.g. Lagos, Abuja, Port Harcourt)"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  autoFocus
                />
                <select
                  className="input-field"
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                >
                  <option value="NG">Nigeria</option>
                  <option value="GH">Ghana</option>
                  <option value="KE">Kenya</option>
                  <option value="ZA">South Africa</option>
                  <option value="GB">United Kingdom</option>
                  <option value="US">United States</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-display text-3xl font-light mb-2" style={{ color: "#FAF7F2" }}>
                Online presence
              </h2>
              <p className="text-sm mb-8" style={{ color: "rgba(250,247,242,0.5)" }}>
                Optional — add what you have. We&apos;ll audit these for you.
              </p>
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,0.4)" strokeWidth="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <input
                    className="input-field pl-8"
                    placeholder="Google Business URL (optional)"
                    value={form.googleBizUrl}
                    onChange={(e) => update("googleBizUrl", e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <AtSign size={14} style={{ color: "rgba(201,169,110,0.4)" }} />
                  </div>
                  <input
                    className="input-field pl-8"
                    placeholder="Instagram handle (e.g. @mybusiness)"
                    value={form.instagramHandle}
                    onChange={(e) => update("instagramHandle", e.target.value)}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Link size={14} style={{ color: "rgba(201,169,110,0.4)" }} />
                  </div>
                  <input
                    className="input-field pl-8"
                    placeholder="Website URL (optional)"
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                  />
                </div>
                <input
                  className="input-field"
                  placeholder="Phone number (optional)"
                  value={form.phoneNumber}
                  onChange={(e) => update("phoneNumber", e.target.value)}
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      {error && (
        <p className="text-xs mt-4" style={{ color: "#ef4444" }}>{error}</p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        {step > 1 ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="text-xs tracking-wide"
            style={{ color: "rgba(250,247,242,0.4)" }}
          >
            ← Back
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={next}
          disabled={!canProceed() || submitting}
          className="btn-gold flex items-center gap-2 px-8 py-3 text-xs tracking-[0.2em] uppercase disabled:opacity-40"
        >
          {submitting ? "Saving…" : step < steps.length ? "Continue" : "Launch Dashboard"}
          {!submitting && <ChevronRight size={13} />}
        </button>
      </div>
    </div>
  );
}
