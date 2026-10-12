"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Icon, { type IconName } from "@/components/art/Icons";
import { buildScanRequest, type Audience, type Fields } from "@/lib/scan-ui/request";
import { didYouMean } from "@/lib/scan-ui/typos";

/**
 * The free scan box. One main action, three ways in: a business with a website, a business on
 * Instagram or WhatsApp, or a person whose name is the brand. No sign-up. The safety check
 * (Turnstile) starts when the visitor first touches the form, so people who only read pay no data
 * for it, and the scan waits for it, so a slow connection never makes the visitor press twice. Tests: tests/front-page, tests/scan-ui/structure.test.ts.
 */

type Turnstile = { render: (el: HTMLElement, o: Record<string, unknown>) => string; reset: (id?: string) => void; remove: (id?: string) => void };
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const SAFETY_CHECK_PATIENCE_MS = 30_000;
const FIELD = "w-full min-h-12 px-4 py-3 text-base bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]";
const FIELD_STYLE = { border: "1px solid rgba(201,169,110,0.35)", color: "#FAF7F2" } as const;

const CHIPS: Array<{ audience: Audience; label: string; icon: IconName }> = [
  { audience: "business", label: "I have a website", icon: "globe" },
  { audience: "social", label: "I'm on Instagram or WhatsApp", icon: "chat" },
  { audience: "personal", label: "It's just me", icon: "user" },
];

const INTRO: Record<Audience, string | null> = {
  business: null,
  social: "No website yet? That is fine. Tell us a little and we will show you where to start.",
  personal: "Your name is your brand. Tell us where people find you and we will show you what to do first.",
};

function Field({ id, label, value, onChange, ...rest }: { id: string; label: string; value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "id">) {
  return (
    <label className="block text-sm" htmlFor={id}>
      {label}
      <input id={id} className={`${FIELD} mt-1`} style={FIELD_STYLE} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
    </label>
  );
}

export default function ScanBox({ initialAudience = "business" }: { initialAudience?: Audience }) {
  const router = useRouter();
  const [audience, setAudience] = useState<Audience>(initialAudience);
  const [f, setF] = useState<Fields>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const token = useRef<string>("");
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const loading = useRef(false);
  const queued = useRef(false); // the visitor pressed the button before the safety check finished
  const sendRef = useRef<() => void>(() => undefined);
  const busyRef = useRef(false);

  const set = (k: keyof Fields) => (v: string) => setF((prev) => ({ ...prev, [k]: v }));
  const suggestion = audience === "business" ? didYouMean(f.website ?? "") : null;

  // The "who it is for" cards further down the page choose an audience for the visitor.
  useEffect(() => {
    const pick = (e: Event) => setAudience((e as CustomEvent<Audience>).detail);
    window.addEventListener("tvo-audience", pick);
    return () => window.removeEventListener("tvo-audience", pick);
  }, []);

  const loadCheck = useCallback(() => {
    if (loading.current || !SITE_KEY) return;
    loading.current = true;
    const draw = () => {
      if (!widget.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(widget.current, {
        sitekey: SITE_KEY,
        theme: "dark",
        // Invisible unless Cloudflare needs the visitor to do something; compact on very small screens.
        appearance: "interaction-only",
        size: window.innerWidth < 380 ? "compact" : "normal",
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
      const body = buildScanRequest(audience, f, token.current);
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
      // If the safety check never finishes (a weak connection), do not leave the visitor waiting for ever.
      setTimeout(() => {
        if (!queued.current) return;
        queued.current = false;
        busyRef.current = false;
        setBusy(false);
        if (window.turnstile) window.turnstile.reset(widgetId.current);
        setMessage("The safety check is slow on this connection. Please press the button again.");
      }, SAFETY_CHECK_PATIENCE_MS);
      return;
    }
    void send();
  }

  // Always points at the latest send(), so the safety-check callback starts the scan with the current form.
  useEffect(() => {
    sendRef.current = send;
  });

  return (
    <form id="scan" onSubmit={submit} className="space-y-4 scroll-mt-6" onFocus={loadCheck} onPointerDown={loadCheck} noValidate>
      <div role="radiogroup" aria-label="Who is this check for?" className="flex flex-wrap gap-2">
        {CHIPS.map((c) => {
          const on = c.audience === audience;
          return (
            <button
              key={c.audience}
              type="button"
              role="radio"
              aria-checked={on}
              data-audience={c.audience}
              onClick={() => setAudience(c.audience)}
              className="inline-flex items-center gap-2 min-h-11 px-4 text-sm focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
              style={on ? { background: "rgba(201,169,110,0.16)", border: "1px solid #C9A96E", color: "#FAF7F2" } : { border: "1px solid rgba(201,169,110,0.3)", color: "rgba(250,247,242,0.7)" }}
            >
              <Icon name={c.icon} className="w-4 h-4" />
              {c.label}
            </button>
          );
        })}
      </div>

      {INTRO[audience] && (
        <p className="text-sm" style={{ color: "rgba(250,247,242,0.7)" }}>
          {INTRO[audience]}
        </p>
      )}

      {audience === "business" && (
        <Field
          id="scan-website" label="Your website address" value={f.website ?? ""} onChange={set("website")} placeholder="yourbusiness.com"
          inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={2000}
        />
      )}

      {audience === "social" && (
        <div className="space-y-3">
          <Field id="scan-name" label="Business name" value={f.name ?? ""} onChange={set("name")} maxLength={120} autoComplete="organization" />
          <div className="grid grid-cols-2 gap-3">
            <Field id="scan-city" label="City" value={f.city ?? ""} onChange={set("city")} maxLength={120} />
            <Field id="scan-category" label="What you sell" value={f.category ?? ""} onChange={set("category")} maxLength={120} />
          </div>
          <Field id="scan-instagram" label="Instagram handle" value={f.instagram ?? ""} onChange={set("instagram")} maxLength={100} autoCapitalize="none" placeholder="@yourbusiness" />
          <Field id="scan-whatsapp" label="WhatsApp number (optional)" value={f.whatsapp ?? ""} onChange={set("whatsapp")} maxLength={40} inputMode="tel" autoComplete="tel" />
        </div>
      )}

      {audience === "personal" && (
        <div className="space-y-3">
          <Field id="scan-name" label="Your name" value={f.name ?? ""} onChange={set("name")} maxLength={120} autoComplete="name" />
          <Field id="scan-category" label="What you do (creator, freelancer, coach...)" value={f.category ?? ""} onChange={set("category")} maxLength={120} />
          <Field id="scan-instagram" label="Instagram handle" value={f.instagram ?? ""} onChange={set("instagram")} maxLength={100} autoCapitalize="none" placeholder="@yourname" />
          <div className="grid grid-cols-2 gap-3">
            <Field id="scan-x" label="X handle" value={f.x ?? ""} onChange={set("x")} maxLength={100} autoCapitalize="none" />
            <Field id="scan-linkedin" label="LinkedIn name" value={f.linkedin ?? ""} onChange={set("linkedin")} maxLength={100} autoCapitalize="none" />
          </div>
        </div>
      )}

      {suggestion && (
        <p className="text-sm" role="status" style={{ color: "#E8D5A3" }}>
          Did you mean{" "}
          <button type="button" className="underline underline-offset-4 min-h-11 px-1" onClick={() => set("website")(suggestion)}>
            {suggestion}
          </button>
          ?
        </p>
      )}

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
