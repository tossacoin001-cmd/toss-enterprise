"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { didYouMean } from "@/lib/scan-ui/typos";

/**
 * The free scan box: one field, one button, no sign-up. People with no website yet open a short
 * form instead. The safety check (Turnstile) loads only when the visitor first touches the box,
 * to keep the first page light. Tests: tests/scan-ui/structure.test.ts.
 */

type Turnstile = { render: (el: HTMLElement, o: Record<string, unknown>) => string; reset: (id?: string) => void; remove: (id?: string) => void };
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const FIELD = "w-full min-h-12 px-4 py-3 text-base bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]";
const FIELD_STYLE = { border: "1px solid rgba(201,169,110,0.35)", color: "#FAF7F2" } as const;

export default function ScanBox() {
  const router = useRouter();
  const [noSite, setNoSite] = useState(false);
  const [website, setWebsite] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const token = useRef<string>("");
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const loading = useRef(false);
  const queued = useRef(false); // the visitor pressed the button before the safety check finished
  const sendRef = useRef<() => void>(() => undefined);
  const busyRef = useRef(false);

  const suggestion = noSite ? null : didYouMean(website);

  const loadCheck = useCallback(() => {
    if (loading.current || !SITE_KEY) return;
    loading.current = true;
    const draw = () => {
      if (!widget.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(widget.current, {
        sitekey: SITE_KEY,
        theme: "dark",
        callback: (t: string) => {
          token.current = t;
          if (queued.current) {
            queued.current = false;
            sendRef.current();
          }
        },
        "expired-callback": () => { token.current = ""; },
        "error-callback": () => { token.current = ""; },
      });
    };
    if (window.turnstile) return draw();
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = draw;
    document.head.appendChild(s);
  }, []);

  async function send() {
    busyRef.current = true;
    setBusy(true);
    let leaving = false;
    try {
      const handles = instagram.trim() ? { instagram: instagram.trim() } : undefined;
      const body = noSite
        ? { name, city, category, handles, whatsapp, token: token.current }
        : { website, token: token.current };
      const res = await fetch("/api/scan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json().catch(() => ({}))) as { id?: string | null; message?: string };
      if (res.ok && data.id) {
        leaving = true;
        return router.push(`/scan/${data.id}`);
      }
      setMessage(data.message ?? "Something went wrong on our side. Please try again in a minute.");
    } catch {
      setMessage("We could not reach our server. Check your connection and try again.");
    } finally {
      // A safety-check token works once: ask for a fresh one for the next try.
      token.current = "";
      if (window.turnstile) window.turnstile.reset(widgetId.current);
      if (!leaving) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busyRef.current) return;
    setMessage(null);
    if (!SITE_KEY) return setMessage("The free scan is not available right now. Please try again soon.");
    if (!token.current) {
      // The safety check can take a few seconds on slow connections: start as soon as it is ready.
      queued.current = true;
      busyRef.current = true;
      setBusy(true);
      setMessage("Running a quick safety check. Your scan starts in a moment.");
      loadCheck();
      return;
    }
    void send();
  }

  // Always points at the latest send(), so the safety-check callback starts the scan with the current form.
  useEffect(() => {
    sendRef.current = send;
  });

  // Start the safety check shortly after the page is ready, so it is usually done before the button is pressed.
  useEffect(() => {
    const t = setTimeout(loadCheck, 1500);
    return () => clearTimeout(t);
  }, [loadCheck]);

  return (
    <form onSubmit={submit} className="space-y-4" onFocus={loadCheck} noValidate>
      {noSite ? (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: "rgba(250,247,242,0.7)" }}>
            No website yet? That is fine. Tell us a little and we will show you where to start.
          </p>
          <label className="block text-sm" htmlFor="scan-name">
            Business or brand name
            <input id="scan-name" className={`${FIELD} mt-1`} style={FIELD_STYLE} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="organization" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm" htmlFor="scan-city">
              City
              <input id="scan-city" className={`${FIELD} mt-1`} style={FIELD_STYLE} value={city} onChange={(e) => setCity(e.target.value)} maxLength={120} />
            </label>
            <label className="block text-sm" htmlFor="scan-category">
              What you do
              <input id="scan-category" className={`${FIELD} mt-1`} style={FIELD_STYLE} value={category} onChange={(e) => setCategory(e.target.value)} maxLength={120} />
            </label>
          </div>
          <label className="block text-sm" htmlFor="scan-instagram">
            Instagram handle (optional)
            <input id="scan-instagram" className={`${FIELD} mt-1`} style={FIELD_STYLE} value={instagram} onChange={(e) => setInstagram(e.target.value)} maxLength={100} autoCapitalize="none" />
          </label>
          <label className="block text-sm" htmlFor="scan-whatsapp">
            WhatsApp number (optional)
            <input id="scan-whatsapp" className={`${FIELD} mt-1`} style={FIELD_STYLE} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} maxLength={40} inputMode="tel" autoComplete="tel" />
          </label>
        </div>
      ) : (
        <label className="block text-sm" htmlFor="scan-website">
          Your website address
          <input
            id="scan-website" className={`${FIELD} mt-1`} style={FIELD_STYLE} value={website} onChange={(e) => setWebsite(e.target.value)}
            placeholder="yourbusiness.com" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={2000}
          />
        </label>
      )}

      {suggestion && (
        <p className="text-sm" role="status" style={{ color: "#E8D5A3" }}>
          Did you mean{" "}
          <button type="button" className="underline underline-offset-4 min-h-11 px-1" onClick={() => setWebsite(suggestion)}>
            {suggestion}
          </button>
          ?
        </p>
      )}

      <button type="button" className="text-sm underline underline-offset-4 min-h-11" style={{ color: "#C9A96E" }} onClick={() => setNoSite((v) => !v)}>
        {noSite ? "I have a website" : "I do not have a website yet"}
      </button>

      <div ref={widget} className="min-h-0" />

      <p className="text-xs leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}>
        Free. No sign-up and no card. By checking you agree to our terms and accept our privacy notice.
      </p>
      <p className="flex gap-2 text-xs">
        <Link href="/terms" className="inline-flex items-center min-h-11 px-2 underline underline-offset-4" style={{ color: "#C9A96E" }}>Read the terms</Link>
        <Link href="/privacy" className="inline-flex items-center min-h-11 px-2 underline underline-offset-4" style={{ color: "#C9A96E" }}>Read the privacy notice</Link>
      </p>

      <button type="submit" disabled={busy} className="btn-gold w-full min-h-12 px-8 py-3.5 text-xs tracking-[0.2em] uppercase focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60">
        {busy ? "Starting your check" : "Check my visibility"}
      </button>

      <p role="alert" aria-live="polite" className="text-sm min-h-5" style={{ color: "#E8D5A3" }}>
        {message}
      </p>
    </form>
  );
}
