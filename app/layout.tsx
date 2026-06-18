import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toss Enterprise — Premium Growth Infrastructure",
  description: "We build digital infrastructure that drives visibility, leads & revenue. Premium websites, AI-powered applications and business growth systems for ambitious brands.",
  keywords: "revenue systems, business growth, AI applications, visibility systems, digital infrastructure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
