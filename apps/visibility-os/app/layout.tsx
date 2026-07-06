import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visibility OS by Toss Enterprise",
  description:
    "See exactly how visible your business is online, and exactly what to fix. Visibility OS scores your Google presence, website, and social profiles, then gives you a ranked action plan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hasClerkConfig = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  const content = (
    <html lang="en">
      <body>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );

  if (!hasClerkConfig) {
    return content;
  }

  return (
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
      {content}
    </ClerkProvider>
  );
}
