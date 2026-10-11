import type { Metadata } from "next";
import Link from "next/link";
import ExampleResult from "@/components/scan/ExampleResult";
import ScanBox from "@/components/scan/ScanBox";
import { SITE_URL, SOCIAL } from "@/lib/brand";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const socialLinks = Object.entries(SOCIAL).filter(([, url]) => url);
const structuredData = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Visibility OS by Toss Enterprise",
  url: SITE_URL,
  telephone: "+2348087919951",
  description: "A free check of how visible your business is online, with a plain list of what to fix first.",
  ...(socialLinks.length ? { sameAs: socialLinks.map(([, url]) => url) } : {}),
};

const steps = [
  {
    n: "01",
    title: "Type your website address",
    desc: "No website yet? Tell us your name and your Instagram instead. No sign-up, no card, about 20 seconds.",
  },
  {
    n: "02",
    title: "See your score",
    desc: "We check your website and social links, say plainly what we could not check, and score you out of 100.",
  },
  {
    n: "03",
    title: "Fix what matters first",
    desc: "Every gap becomes a plain-language action item, ranked by impact. Re-run the audit and watch the score climb.",
  },
];

const checks = [
  {
    title: "Google presence",
    items: ["Google Business Profile", "Phone number customers can call", "Category and location"],
  },
  {
    title: "Website health",
    items: ["Loads and stays up", "HTTPS security", "Titles and search descriptions", "Mobile-friendly", "Speed"],
  },
  {
    title: "Social presence",
    items: ["Instagram profile", "Handle customers can find"],
  },
];

function Logo() {
  return (
    <span className="flex items-center gap-3">
      <span
        className="w-8 h-8 flex items-center justify-center shrink-0"
        style={{ border: "1px solid rgba(201,169,110,0.3)" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" stroke="#C9A96E" strokeWidth="2" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <span className="font-display text-lg font-light" style={{ color: "#FAF7F2" }}>
        Visibility <span className="gold-text font-semibold">OS</span>
      </span>
    </span>
  );
}

export default function Home() {
  return (
    <div className="relative" style={{ background: "linear-gradient(180deg, #092D22 0%, #050E09 55%)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="hero-grid absolute inset-0 pointer-events-none" />

      {/* Nav */}
      <header className="relative max-w-6xl mx-auto px-6 h-16 sm:h-20 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="px-4 py-3 text-xs tracking-[0.15em] uppercase whitespace-nowrap"
            style={{ color: "rgba(250,247,242,0.6)" }}
          >
            Sign in
          </Link>
          <Link href="/sign-up" className="btn-gold hidden sm:inline-block px-5 py-2.5 text-xs tracking-[0.15em] uppercase">
            Get your score
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-4 sm:pt-16 pb-20 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <p className="hidden sm:block text-[11px] tracking-[0.3em] uppercase mb-5" style={{ color: "#C9A96E" }}>
            A Toss Enterprise product
          </p>
          <h1
            className="font-display text-4xl sm:text-6xl font-light leading-[1.05] mb-4 sm:mb-6"
            style={{ color: "#FAF7F2" }}
          >
            Know exactly how <span className="gold-text font-medium">visible</span> your business is online.
          </h1>
          <p className="text-sm sm:text-base leading-relaxed max-w-md mb-5 sm:mb-9" style={{ color: "rgba(250,247,242,0.55)" }}>
            Visibility OS audits your Google presence, website, and social profiles, scores you out of 100,
            and hands you a ranked action plan. Built for ambitious local businesses, from Lagos to anywhere.
          </p>
          <div className="max-w-md"><ScanBox /></div>
        </div>

        <ExampleResult />
      </section>

      {/* How it works */}
      <section className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-10">
          <div className="section-line" />
          <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#C9A96E" }}>
            How it works
          </span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {steps.map((s) => (
            <div key={s.n} className="green-card p-6">
              <div className="font-display text-3xl font-light mb-4 gold-text">{s.n}</div>
              <h3 className="text-sm font-medium mb-2" style={{ color: "#FAF7F2" }}>
                {s.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What we check */}
      <section className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-10">
          <div className="section-line" />
          <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#C9A96E" }}>
            What we check
          </span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {checks.map((c) => (
            <div key={c.title} className="stat-card p-6">
              <h3 className="text-sm font-medium mb-4" style={{ color: "#FAF7F2" }}>
                {c.title}
              </h3>
              <ul className="space-y-2">
                {c.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs" style={{ color: "rgba(250,247,242,0.5)" }}>
                    <span className="w-1 h-1 rounded-full shrink-0" style={{ background: "#C9A96E" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="relative max-w-6xl mx-auto px-6 py-20">
        <div className="green-card p-10 sm:p-14 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-light mb-4" style={{ color: "#FAF7F2" }}>
            If customers can&apos;t find you, they buy from someone they can.
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "rgba(250,247,242,0.5)" }}>
            Two minutes to connect your business. One score that tells you where you stand and what to do next.
          </p>
          <Link href="/sign-up" className="btn-gold inline-block px-10 py-4 text-xs tracking-[0.2em] uppercase">
            Get your free score
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative max-w-6xl mx-auto px-6 py-10 flex items-center justify-between flex-wrap gap-4">
        <Logo />
        <p className="text-xs" style={{ color: "rgba(250,247,242,0.35)" }}>
          Built by{" "}
          <a
            href="https://toss-enterprise.vercel.app"
            className="underline underline-offset-4"
            style={{ color: "#C9A96E" }}
          >
            Toss Enterprise
          </a>
          . <Link href="/privacy" className="underline underline-offset-4" style={{ color: "#C9A96E" }}>Privacy</Link>
          {" · "}
          <Link href="/terms" className="underline underline-offset-4" style={{ color: "#C9A96E" }}>Terms</Link>
          {socialLinks.map(([name, url]) => (
            <span key={name}>
              {" · "}
              <a href={url} rel="noopener noreferrer" className="underline underline-offset-4" style={{ color: "#C9A96E" }}>{name === "x" ? "X" : "LinkedIn"}</a>
            </span>
          ))}
          . Questions?{" "}
          <a
            href="https://wa.me/2348087919951"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
            style={{ color: "#C9A96E" }}
          >
            WhatsApp +234 808 791 9951
          </a>
        </p>
      </footer>
    </div>
  );
}
