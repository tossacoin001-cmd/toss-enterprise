import type { Metadata } from "next";
import ServicesContent from "@/components/ServicesContent";

export const metadata: Metadata = {
  title: "Services — Toss Enterprise",
  description: "Visibility Systems, Revenue Websites, AI Applications, and Business Automation — four integrated growth systems for ambitious brands in Nigeria and globally.",
};

export default function ServicesPage() {
  return <ServicesContent />;
}
