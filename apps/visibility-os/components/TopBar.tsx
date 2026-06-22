"use client";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/businesses": "My Businesses",
  "/settings": "Settings",
  "/onboarding": "Setup",
};

interface TopBarProps {
  onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();

  const title = Object.entries(pageTitles).find(([key]) =>
    pathname === key || pathname.startsWith(key + "/")
  )?.[1] ?? "Visibility OS";

  return (
    <header
      className="h-14 flex items-center justify-between px-5 shrink-0"
      style={{
        background: "#050E09",
        borderBottom: "1px solid rgba(201,169,110,0.08)",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <button
          className="lg:hidden p-1.5"
          style={{ color: "rgba(250,247,242,0.5)" }}
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <h1
          className="font-display text-xl font-light"
          style={{ color: "#FAF7F2" }}
        >
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications placeholder */}
        <button
          className="relative p-1.5 transition-colors"
          style={{ color: "rgba(250,247,242,0.4)" }}
          aria-label="Notifications"
        >
          <Bell size={16} strokeWidth={1.5} />
        </button>

        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
              userButtonPopoverCard: {
                background: "#092D22",
                border: "1px solid rgba(201,169,110,0.15)",
                boxShadow: "0 0 40px rgba(0,0,0,0.5)",
              },
            },
          }}
        />
      </div>
    </header>
  );
}
