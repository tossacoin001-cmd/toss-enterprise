import Link from "next/link";

const sampleBreakdown = [
  { label: "Google", value: 40, max: 100 },
  { label: "Website", value: 85, max: 100 },
  { label: "Social", value: 70, max: 100 },
];

const sampleActions = [
  { priority: "#ef4444", title: "Claim your Google Business Profile", tag: "Google" },
  { priority: "#C9A96E", title: "Add a search description to your website", tag: "Website" },
];

const steps = [
  {
    n: "01",
    title: "Connect your business",
    desc: "Name, city, website, Instagram, Google profile. Two minutes, no technical setup.",
  },
  {
    n: "02",
    title: "Get your score",
    desc: "We audit your Google presence, website health, and social profiles, then score you out of 100.",
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
      <div className="hero-grid absolute inset-0 pointer-events-none" />

      {/* Nav */}
      <header className="relative max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="px-4 py-2 text-xs tracking-[0.15em] uppercase"
            style={{ color: "rgba(250,247,242,0.6)" }}
          >
            Sign in
          </Link>
          <Link href="/sign-up" className="btn-gold px-5 py-2.5 text-xs tracking-[0.15em] uppercase">
            Get your score
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase mb-5" style={{ color: "#C9A96E" }}>
            A Toss Enterprise product
          </p>
          <h1
            className="font-display text-5xl sm:text-6xl font-light leading-[1.05] mb-6"
            style={{ color: "#FAF7F2" }}
          >
            Know exactly how <span className="gold-text font-medium">visible</span> your business is online.
          </h1>
          <p className="text-base leading-relaxed max-w-md mb-9" style={{ color: "rgba(250,247,242,0.55)" }}>
            Visibility OS audits your Google presence, website, and social profiles, scores you out of 100,
            and hands you a ranked action plan. Built for ambitious local businesses, from Lagos to anywhere.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/sign-up" className="btn-gold px-8 py-3.5 text-xs tracking-[0.2em] uppercase">
              Get your free score
            </Link>
            <span className="text-xs" style={{ color: "rgba(250,247,242,0.35)" }}>
              Free in early access. No card needed.
            </span>
          </div>
        </div>

        {/* Score mock */}
        <div className="green-card p-7" aria-hidden="true">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: "#C9A96E" }}>
                Restaurant, Lagos
              </p>
              <p className="font-display text-2xl font-light" style={{ color: "#FAF7F2" }}>
                Adaeze&apos;s Kitchen
              </p>
            </div>
            <div className="text-right">
              <div className="font-display text-5xl font-light gold-text">64</div>
              <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "rgba(250,247,242,0.4)" }}>
                Visibility score
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {sampleBreakdown.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: "rgba(250,247,242,0.6)" }}>{b.label}</span>
                  <span style={{ color: "#C9A96E" }}>{b.value}</span>
                </div>
                <div className="score-bar-track">
                  <div className="score-bar-fill" style={{ width: `${(b.value / b.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {sampleActions.map((a) => (
              <div key={a.title} className="action-item">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: a.priority }} />
                <span className="flex-1 text-sm" style={{ color: "#FAF7F2" }}>
                  {a.title}
                </span>
                <span className="badge badge-gold shrink-0">{a.tag}</span>
              </div>
            ))}
          </div>
        </div>
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
          . Questions? WhatsApp +234 808 791 9951
        </p>
      </footer>
    </div>
  );
}
