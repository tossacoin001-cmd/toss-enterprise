import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visibility OS",
  description: "Enterprise Visibility Operating System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hasClerkConfig = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  const content = (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
          {children}
        </main>
      </body>
    </html>
  );

  if (!hasClerkConfig) {
    return content;
  }

  return <ClerkProvider>{content}</ClerkProvider>;
}
