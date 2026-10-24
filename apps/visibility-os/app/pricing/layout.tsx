import type { Metadata } from "next";
import "../workspace.css";

export const metadata: Metadata = {
  title: "Pricing | Visibility OS",
  description: "Visibility OS plans start at ₦10,000 a month. Try it free for 7 days, no card needed. Pay for a year and get 2 months free.",
  alternates: { canonical: "/pricing" },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <div className="ws-root" style={{ minHeight: "100vh" }}>{children}</div>;
}
