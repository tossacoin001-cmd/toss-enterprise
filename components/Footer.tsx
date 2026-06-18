import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="pt-20 pb-10 px-6"
      style={{ background: "#050E09", borderTop: "1px solid rgba(201,169,110,0.08)" }}
    >
      <style>{`
        .footer-link { color: rgba(250,247,242,0.4); font-size: 0.75rem; text-decoration: none; transition: color 0.3s; }
        .footer-link:hover { color: #C9A96E; }
      `}</style>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10">
                <Image src="/logo.svg" alt="Toss Enterprise" fill className="object-contain" />
              </div>
              <div>
                <span className="font-display text-lg font-semibold tracking-widest gold-text uppercase">
                  Toss
                </span>
                <span
                  className="block text-[10px] tracking-[0.3em] uppercase"
                  style={{ color: "#C9A96E", opacity: 0.6, marginTop: "-2px" }}
                >
                  Enterprise
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(250,247,242,0.4)" }}>
              Premium growth infrastructure for ambitious brands. We build visibility systems, revenue websites, AI applications, and business automation.
            </p>
            <p className="text-xs mt-6 tracking-wider" style={{ color: "rgba(250,247,242,0.2)" }}>
              Premium Growth Infrastructure For Modern Businesses
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs tracking-[0.3em] uppercase mb-6" style={{ color: "#C9A96E" }}>
              Services
            </h4>
            <ul className="space-y-3">
              {["Visibility Systems", "Revenue Websites", "AI Applications", "Business Automation", "Growth Retainers"].map((s) => (
                <li key={s}>
                  <a href="#services" className="footer-link">{s}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs tracking-[0.3em] uppercase mb-6" style={{ color: "#C9A96E" }}>
              Company
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Our Work", href: "#portfolio" },
                { label: "Process", href: "#process" },
                { label: "Pricing", href: "#pricing" },
                { label: "Book a Call", href: "#contact" },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="footer-link">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(201,169,110,0.06)" }}
        >
          <p className="text-xs" style={{ color: "rgba(250,247,242,0.2)" }}>
            © {year} Toss Enterprise. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "rgba(250,247,242,0.2)" }}>
            Premium Growth Infrastructure
          </p>
        </div>
      </div>
    </footer>
  );
}
