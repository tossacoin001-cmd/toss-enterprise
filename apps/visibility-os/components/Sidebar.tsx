"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Sparkles,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/businesses", label: "My Businesses", icon: Building2 },
  { href: "/reports", label: "Reports", icon: BarChart3, soon: true },
  { href: "/ai-audit", label: "AI Audit", icon: Sparkles, soon: true },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <aside
      className="flex flex-col h-full w-64 shrink-0"
      style={{ background: "#050E09", borderRight: "1px solid rgba(201,169,110,0.08)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: "1px solid rgba(201,169,110,0.08)" }}
      >
        <div
          className="w-8 h-8 flex items-center justify-center shrink-0"
          style={{ border: "1px solid rgba(201,169,110,0.3)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" stroke="#C9A96E" strokeWidth="2" />
            <path
              d="M12 2v4M12 18v4M2 12h4M18 12h4"
              stroke="#C9A96E"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <div
            className="font-display text-base font-light leading-none"
            style={{ color: "#FAF7F2" }}
          >
            Visibility <span className="gold-text">OS</span>
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: "rgba(250,247,242,0.3)" }}>
            Toss Enterprise
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, soon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <div key={href} className="relative">
              {soon ? (
                <div
                  className="sidebar-item opacity-40 cursor-not-allowed select-none"
                  title="Coming soon"
                >
                  <Icon size={15} strokeWidth={1.5} />
                  <span>{label}</span>
                  <span
                    className="ml-auto text-[9px] tracking-wider px-1.5 py-0.5"
                    style={{ background: "rgba(201,169,110,0.1)", color: "rgba(201,169,110,0.5)" }}
                  >
                    SOON
                  </span>
                </div>
              ) : (
                <Link href={href} className={`sidebar-item ${isActive ? "active" : ""}`}>
                  <Icon size={15} strokeWidth={1.5} />
                  <span>{label}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Plan indicator */}
      <div
        className="mx-3 mb-3 p-3"
        style={{ background: "rgba(9,45,34,0.4)", border: "1px solid rgba(201,169,110,0.1)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap size={11} style={{ color: "#C9A96E" }} />
          <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: "#C9A96E" }}>
            Free Plan
          </span>
        </div>
        <p className="text-[10px] mb-2.5" style={{ color: "rgba(250,247,242,0.4)" }}>
          1 business · Basic tracking
        </p>
        <Link
          href="/settings"
          className="block text-center py-1.5 text-[10px] tracking-[0.15em] uppercase btn-gold"
        >
          Upgrade →
        </Link>
      </div>

      {/* Sign out */}
      <div style={{ borderTop: "1px solid rgba(201,169,110,0.08)" }}>
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="sidebar-item w-full"
        >
          <LogOut size={15} strokeWidth={1.5} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
