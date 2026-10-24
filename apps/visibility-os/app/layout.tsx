import type { Metadata, Viewport } from "next";
import "./globals.css";

const TITLE = "Visibility OS by Toss Enterprise";
// 155 characters or fewer, so search results show all of it. It says only what the scan really does.
const DESCRIPTION = "Find out in 20 seconds how easy you are to find online and what to fix first. Free, with no sign-up, for businesses and for people building a name.";

export const metadata: Metadata = {
  metadataBase: new URL("https://tossvisibilityos.com"),
  title: TITLE,
  description: DESCRIPTION,
  // The share card (WhatsApp, X, LinkedIn) comes from app/opengraph-image.tsx.
  openGraph: { title: TITLE, description: DESCRIPTION, url: "https://tossvisibilityos.com", siteName: "Visibility OS", type: "website", locale: "en_NG" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = { themeColor: "#092D22" };

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
