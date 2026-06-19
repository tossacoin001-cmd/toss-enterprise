import type { Metadata } from "next";
import PricingContent from "@/components/PricingContent";

export const metadata: Metadata = {
  title: "Pricing — Toss Enterprise",
  description: "Transparent, fixed-scope pricing from $799. No hourly billing, no surprise invoices. Packages for Nigerian and global businesses. Paystack and Flutterwave accepted.",
};

export default function PricingPage() {
  return <PricingContent />;
}
