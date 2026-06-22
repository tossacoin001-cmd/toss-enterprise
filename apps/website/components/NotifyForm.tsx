"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotifyForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    const msg = encodeURIComponent(
      `Hi Toss Enterprise! I'd like to be notified when Digital Products launches.\n\nName: ${name || "Not provided"}\nEmail: ${email}`
    );
    window.open(`https://wa.me/2348087919951?text=${msg}`, "_blank");
    setSubmitted(true);
  }

  return (
    <AnimatePresence mode="wait">
      {!submitted ? (
        <motion.form
          key="form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 w-full max-w-sm mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4 }}
        >
          <input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-3.5 text-sm bg-transparent outline-none"
            style={{
              border: "1px solid rgba(201,169,110,0.2)",
              color: "#FAF7F2",
              caretColor: "#C9A96E",
            }}
          />
          <input
            type="email"
            required
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3.5 text-sm bg-transparent outline-none"
            style={{
              border: "1px solid rgba(201,169,110,0.25)",
              color: "#FAF7F2",
              caretColor: "#C9A96E",
            }}
          />
          <button
            type="submit"
            className="btn-gold w-full py-4 text-xs tracking-[0.2em] uppercase"
          >
            Notify Me at Launch →
          </button>
          <p className="text-[10px] text-center" style={{ color: "rgba(250,247,242,0.25)" }}>
            Your details go directly to us via WhatsApp. No spam.
          </p>
        </motion.form>
      ) : (
        <motion.div
          key="success"
          className="text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-14 h-14 mx-auto mb-5 flex items-center justify-center"
            style={{ border: "1px solid rgba(201,169,110,0.3)", background: "rgba(201,169,110,0.05)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: "#FAF7F2" }}>You&apos;re on the list.</p>
          <p className="text-xs" style={{ color: "rgba(250,247,242,0.4)" }}>
            Check your WhatsApp — we&apos;ll confirm your spot.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
