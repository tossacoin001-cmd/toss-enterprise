"use client";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/actions": "Action plan",
  "/reports": "Reports",
  "/businesses": "Businesses",
  "/settings": "Settings",
  "/onboarding": "Set up your business",
};

interface TopBarProps {
  onMenuClick?: () => void;
  menuRef?: React.Ref<HTMLButtonElement>;
  menuOpen?: boolean;
}

/** The strip above every page: the menu button on a phone and where you are. Pages carry their own main heading. */
export default function TopBar({ onMenuClick, menuRef, menuOpen = false }: TopBarProps) {
  const pathname = usePathname();
  const title = Object.entries(pageTitles).find(([key]) => pathname === key || pathname.startsWith(key + "/"))?.[1] ?? "Visibility OS";

  return (
    <div className="ws-topbar h-14 flex items-center gap-3 px-4 sm:px-6 shrink-0">
      <button ref={menuRef} type="button" className="ws-btn ws-btn--ghost lg:hidden" style={{ minWidth: 44, padding: 0 }} onClick={onMenuClick} aria-label="Open menu" aria-expanded={menuOpen}>
        <Menu size={20} aria-hidden="true" />
      </button>
      <p className="ws-h3" aria-hidden="true">{title}</p>
    </div>
  );
}
