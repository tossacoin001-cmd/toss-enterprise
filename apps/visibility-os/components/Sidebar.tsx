"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { LayoutDashboard, ListChecks, Building2, BarChart3, CreditCard, Settings, LogOut, X } from "lucide-react";

// Every item goes somewhere real. Anything not built yet is simply not listed.
const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/actions", label: "Action plan", icon: ListChecks },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/businesses", label: "Businesses", icon: Building2 },
  { href: "/plans", label: "Plans", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

// The root layout only mounts ClerkProvider when this key is set (so CI and
// key-less local builds still prerender); useClerk() throws without it.
const hasClerkConfig = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function ClerkSignOutButton({ onClose }: SidebarProps) {
  const router = useRouter();
  const { signOut } = useClerk();

  function handleSignOut() {
    onClose?.();
    signOut(() => router.push("/"));
  }

  return (
    <button type="button" onClick={handleSignOut} className="ws-nav-item">
      <LogOut size={18} aria-hidden="true" />
      <span>Sign out</span>
    </button>
  );
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="ws-sidebar flex flex-col h-full w-64 shrink-0" aria-label="Main">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex-1 min-w-0">
          <p style={{ fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.1 }}>Visibility OS</p>
          <p style={{ fontSize: "0.78rem", color: "var(--ws-nav-muted)", marginTop: 2 }}>by Toss Enterprise</p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="ws-nav-item lg:hidden" style={{ width: 44, padding: 0, justifyContent: "center" }} aria-label="Close menu">
            <X size={20} aria-hidden="true" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto" aria-label="Sections">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} className="ws-nav-item" aria-current={isActive ? "page" : undefined} onClick={onClose}>
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        {hasClerkConfig ? (
          <ClerkSignOutButton onClose={onClose} />
        ) : (
          <Link href="/" className="ws-nav-item" onClick={onClose}>
            <LogOut size={18} aria-hidden="true" />
            <span>Sign out</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
