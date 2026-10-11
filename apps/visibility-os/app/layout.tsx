import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tossvisibilityos.com"),
  title: "Visibility OS by Toss Enterprise",
  description:
    "See exactly how visible your business is online, and exactly what to fix. Visibility OS scores your Google presence, website, and social profiles, then gives you a ranked action plan.",
};

// No Clerk here on purpose: the public front door (home page, and the coming
// instant scan) must stay light. Pages that need Clerk mount the provider in
// their own layout. See ADR-0014 and tests/page-structure.test.ts.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
