import Image from "next/image";
import Link from "next/link";

const serviceLinks = [
  { label: "Visibility Systems", href: "/services#visibility" },
  { label: "Revenue Websites", href: "/services#websites" },
  { label: "AI Applications", href: "/services#ai" },
  { label: "Business Automation", href: "/services#automation" },
  { label: "Growth Retainers", href: "/pricing" },
];

const companyLinks = [
  { label: "Our Work", href: "/work" },
  { label: "Process", href: "/process" },
  { label: "Pricing", href: "/pricing" },
  { label: "Digital Products", href: "/products" },
  { label: "Book a Call", href: "/contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="pt-20 pb-10 px-6"
      style={{ background: "#050E09", borderTop: "1px solid rgba(201,169,110,0.08)" }}
    >
      <style>{`
        .footer-link {
          color: rgba(250,247,242,0.4);
          font-size: 0.75rem;
          text-decoration: none;
          transition: color 0.3s;
          display: inline-block;
        }
        .footer-link:hover { color: #C9A96E; }
        .footer-products-link {
          color: #C9A96E;
          font-size: 0.75rem;
          text-decoration: none;
          transition: opacity 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .footer-products-link:hover { opacity: 0.7; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 w-fit group">
              <div className="relative w-11 h-11 shrink-0">
                <Image
                  src="/logo-mark.png"
                  alt="Toss Enterprise"
                  fill
                  className="object-contain transition-opacity duration-300 group-hover:opacity-90"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-base font-semibold tracking-[0.25em] uppercase gold-text">
                  TOSS
                </span>
                <span
                  className="text-[9px] tracking-[0.35em] uppercase font-light"
                  style={{ color: "rgba(201,169,110,0.6)", marginTop: "1px" }}
                >
                  ENTERPRISE
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(250,247,242,0.4)" }}>
              Premium growth infrastructure for ambitious brands. Visibility systems, revenue websites, AI applications, and business automation.
            </p>

            {/* Digital Products CTA — high-visibility placement */}
            <Link href="/products" className="products-cta mt-8">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              Browse Digital Products
            </Link>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs tracking-[0.3em] uppercase mb-6" style={{ color: "#C9A96E" }}>
              Services
            </h4>
            <ul className="space-y-3">
              {serviceLinks.map((s) => (
                <li key={s.label}>
                  <Link href={s.href} className="footer-link">{s.label}</Link>
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
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className={l.label === "Digital Products" ? "footer-products-link" : "footer-link"}
                  >
                    {l.label === "Digital Products" && (
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                        style={{ background: "#C9A96E" }}
                      />
                    )}
                    {l.label}
                  </Link>
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
