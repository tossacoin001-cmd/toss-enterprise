import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Toss Enterprise — Premium Growth Infrastructure",
  description:
    "We build digital infrastructure that drives visibility, leads & revenue. Premium websites, AI applications, and business automation systems for ambitious brands worldwide.",
  keywords: "web design Nigeria, digital agency Lagos, AI applications, business automation, revenue websites, SEO Nigeria",
  authors: [{ name: "Toss Enterprise" }],
  creator: "Toss Enterprise",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Toss Enterprise — Premium Growth Infrastructure",
    description: "Premium websites, AI-powered applications, and business growth systems engineered for ambitious brands.",
    siteName: "Toss Enterprise",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toss Enterprise — Premium Growth Infrastructure",
    description: "Premium websites, AI-powered applications, and business growth systems engineered for ambitious brands.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
