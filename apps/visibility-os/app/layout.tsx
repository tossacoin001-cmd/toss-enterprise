import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visibility OS",
  description: "Enterprise Visibility Operating System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
          {children}
        </main>
      </body>
    </html>
  );
}
