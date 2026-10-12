import type { Metadata } from "next";
import Link from "next/link";
import Icon, { type IconName } from "@/components/art/Icons";
import Person from "@/components/art/People";
import AudienceCards from "@/components/home/AudienceCards";
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
  description: "A free check of how easy you are to find online, with a plain list of what to fix first.",
  ...(socialLinks.length ? { sameAs: socialLinks.map(([, url]) => url) } : {}),
};

const steps: Array<{ n: string; icon: IconName; title: string; desc: string }> = [
  { n: "01", icon: "user", title: "Say who you are", desc: "Pick one: you have a website, you sell on Instagram or WhatsApp, or it is just you. Type your address or your handle." },
  { n: "02", icon: "search", title: "See the result", desc: "In about 20 seconds you see what is working, what is missing, and what we could not check. Nothing is locked." },
  { n: "03", icon: "check", title: "Fix one thing", desc: "Each fix has simple steps you can follow yourself, or you can ask Toss to do it for you on WhatsApp." },
];

const checks: Array<{ icon: IconName; title: string; items: string[]; note?: string }> = [
  { icon: "globe", title: "Your website", items: ["It opens, and it is secure", "It fits a phone screen", "People can see how to reach you", "Google can read your page"] },
  { icon: "link", title: "Your social links", items: ["Your website links to them", "X, YouTube and LinkedIn pages are real"], note: "We cannot look inside Instagram, Facebook or TikTok, so we take your word and say so. We never count them." },
  { icon: "spark", title: "Your Google listing", items: ["Your place on Google Maps", "Reviews and rating"], note: "Coming soon. Connect it after you sign up and we add it to your score." },
];

const trust: Array<{ icon: IconName; text: string }> = [
  { icon: "spark", text: "Free. No sign-up and no card." },
  { icon: "search", text: "We read public pages only." },
  { icon: "shield", text: "We never store your IP address. Results you do not save are deleted after 30 days." },
  { icon: "chat", text: "Real people at Toss Enterprise answer on WhatsApp." },
];

function Logo() {
  return (
    <span className="flex items-center gap-3 whitespace-nowrap">
      <span className="w-8 h-8 flex items-center justify-center shrink-0" style={{ border: "1px solid rgba(201,169,110,0.3)" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      <div className="section-line" />
      <h2 className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#C9A96E" }}>{children}</h2>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative" style={{ background: "linear-gradient(180deg, #092D22 0%, #050E09 55%)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="hero-grid absolute inset-0 pointer-events-none" />

      <header className="relative max-w-6xl mx-auto px-6 h-16 sm:h-20 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-3">
          <Link href="/sign-in" className="inline-flex items-center min-h-11 px-4 text-xs tracking-[0.15em] uppercase whitespace-nowrap" style={{ color: "rgba(250,247,242,0.6)" }}>
            Sign in
          </Link>
        </nav>
      </header>

      <section className="relative max-w-6xl mx-auto px-6 pt-4 sm:pt-12 pb-16 grid grid-cols-[minmax(0,1fr)] lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        <div className="min-w-0">
          <p className="rise hidden sm:block text-[11px] tracking-[0.3em] uppercase mb-5" style={{ color: "#C9A96E" }}>
            A Toss Enterprise product
          </p>
          <h1 className="rise rise-1 font-display text-4xl sm:text-6xl font-light leading-[1.05] mb-4 sm:mb-6" style={{ color: "#FAF7F2" }}>
            Can people find <span className="gold-text font-medium">you</span> online?
          </h1>
          <p className="rise rise-2 text-sm sm:text-base leading-relaxed max-w-md mb-5 sm:mb-8" style={{ color: "rgba(250,247,242,0.65)" }}>
            Find out in 20 seconds, for free. See what is working, what is missing and what to fix first. For a business with a website,
            a business on Instagram or WhatsApp, or anyone building their own name.
          </p>
          <div className="rise rise-3 max-w-md">
            <ScanBox />
          </div>
        </div>

        <div className="pop">
          <ExampleResult />
        </div>
      </section>

      <section className="relative max-w-6xl mx-auto px-6 py-14" aria-labelledby="for-you">
        <SectionTitle>
          <span id="for-you">Made for you, whoever you are</span>
        </SectionTitle>
        <AudienceCards
          cards={[
            { audience: "business", title: "You have a website", text: "See if it opens fast, fits a phone and can be found by the people who search for you.", cta: "Check my website", art: <Person kind="business" className="w-24 h-24 float" /> },
            { audience: "social", title: "You sell on Instagram or WhatsApp", text: "No website yet? You still get a plan. We show you where to start, with free steps first.", cta: "Show me where to start", art: <Person kind="social" className="w-24 h-24 float float-2" /> },
            { audience: "personal", title: "It is just you", text: "A creator, freelancer or coach? See how easy you are to find by your own name.", cta: "Check my name", art: <Person kind="personal" className="w-24 h-24 float float-3" /> },
          ]}
        />
      </section>

      <section className="relative max-w-6xl mx-auto px-6 py-14" aria-labelledby="how">
        <SectionTitle>
          <span id="how">How it works</span>
        </SectionTitle>
        <div className="grid md:grid-cols-3 gap-4">
          {steps.map((s) => (
            <div key={s.n} className="green-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="font-display text-3xl font-light gold-text">{s.n}</div>
                <span style={{ color: "#C9A96E" }}><Icon name={s.icon} className="w-6 h-6" /></span>
              </div>
              <h3 className="text-sm font-medium mb-2" style={{ color: "#FAF7F2" }}>{s.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(250,247,242,0.6)" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative max-w-6xl mx-auto px-6 py-14" aria-labelledby="checks">
        <SectionTitle>
          <span id="checks">What we check, and what we cannot</span>
        </SectionTitle>
        <div className="grid md:grid-cols-3 gap-4">
          {checks.map((c) => (
            <div key={c.title} className="stat-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <span style={{ color: "#C9A96E" }}><Icon name={c.icon} className="w-5 h-5" /></span>
                <h3 className="text-sm font-medium" style={{ color: "#FAF7F2" }}>{c.title}</h3>
              </div>
              <ul className="space-y-2">
                {c.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs" style={{ color: "rgba(250,247,242,0.65)" }}>
                    <span className="w-1 h-1 rounded-full shrink-0" style={{ background: "#C9A96E" }} />
                    {item}
                  </li>
                ))}
              </ul>
              {c.note && <p className="text-xs mt-4 leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}>{c.note}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="relative max-w-6xl mx-auto px-6 py-10" aria-label="Who we are and what we keep">
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trust.map((t) => (
            <li key={t.text} className="flex items-start gap-3 text-xs leading-relaxed" style={{ color: "rgba(250,247,242,0.65)" }}>
              <span style={{ color: "#C9A96E" }} className="shrink-0 mt-0.5"><Icon name={t.icon} className="w-5 h-5" /></span>
              {t.text}
            </li>
          ))}
        </ul>
      </section>

      <section className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="green-card p-10 sm:p-14 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-light mb-4" style={{ color: "#FAF7F2" }}>
            If people cannot find you, they find someone else.
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "rgba(250,247,242,0.6)" }}>
            It takes 20 seconds to see where you stand and what to do first.
          </p>
          <a href="#scan" className="btn-gold inline-flex items-center justify-center min-h-12 px-10 text-xs tracking-[0.2em] uppercase">
            Start my free check
          </a>
        </div>
      </section>

      <footer className="relative max-w-6xl mx-auto px-6 py-10 flex items-center justify-between flex-wrap gap-4">
        <Logo />
        <p className="text-xs" style={{ color: "rgba(250,247,242,0.45)" }}>
          Built by{" "}
          <a href="https://toss-enterprise.vercel.app" className="underline underline-offset-4" style={{ color: "#C9A96E" }}>
            Toss Enterprise
          </a>
          . <Link href="/privacy" className="underline underline-offset-4" style={{ color: "#C9A96E" }}>Privacy</Link>
          {" · "}
          <Link href="/terms" className="underline underline-offset-4" style={{ color: "#C9A96E" }}>Terms</Link>
          {socialLinks.map(([name, url]) => (
            <span key={name}>
              {" · "}
              <a href={url} rel="noopener noreferrer" className="underline underline-offset-4" style={{ color: "#C9A96E" }}>{name === "x" ? "Follow us on X" : "Follow us on LinkedIn"}</a>
            </span>
          ))}
          . Questions?{" "}
          <a href="https://wa.me/2348087919951" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4" style={{ color: "#C9A96E" }}>
            WhatsApp +234 808 791 9951
          </a>
        </p>
      </footer>
    </div>
  );
}
