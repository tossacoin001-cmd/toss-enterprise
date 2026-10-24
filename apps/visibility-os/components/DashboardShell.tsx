"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

/**
 * The workspace frame: forest-green navigation, an ivory page. On a phone the navigation is a drawer
 * that closes with Escape or a tap outside, moves focus into itself when it opens and gives it back
 * when it closes. Tests: tests/workspace/shell.test.ts.
 */
export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);

  // Closes the mobile drawer on route change (e.g. browser back/forward),
  // as a backstop to the onClose passed into each nav link. Adjusting state
  // during render, not an effect, avoids an extra post-commit render pass.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setSidebarOpen(false);
  }

  useEffect(() => {
    if (!sidebarOpen) return;
    const opener = menuButton.current;
    drawer.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
      if (e.key === "Tab" && drawer.current) {
        const focusable = [...drawer.current.querySelectorAll<HTMLElement>("a, button")].filter((el) => !el.hasAttribute("disabled"));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [sidebarOpen]);

  return (
    <div className="ws-root flex h-screen overflow-hidden">
      <a href="#main" className="ws-btn ws-btn--small" style={{ position: "absolute", left: -9999, top: 8, zIndex: 100 }} onFocus={(e) => (e.currentTarget.style.left = "8px")} onBlur={(e) => (e.currentTarget.style.left = "-9999px")}>
        Skip to the page
      </a>

      {/* Desktop navigation */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile navigation drawer */}
      {sidebarOpen && <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} style={{ background: "rgba(10,20,15,0.55)" }} aria-hidden="true" />}
      <div
        ref={drawer}
        role={sidebarOpen ? "dialog" : undefined}
        aria-modal={sidebarOpen ? true : undefined}
        aria-label={sidebarOpen ? "Menu" : undefined}
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        inert={!sidebarOpen}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen((v) => !v)} menuRef={menuButton} menuOpen={sidebarOpen} />
        <main id="main" className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
