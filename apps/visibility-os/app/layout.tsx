import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toss Visibility OS",
  description: "Track and grow your business visibility across Google, social media, and the web.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#C9A96E",
          colorBackground: "#092D22",
          colorText: "#FAF7F2",
          colorTextSecondary: "rgba(250,247,242,0.6)",
          colorInputBackground: "#050E09",
          colorInputText: "#FAF7F2",
          borderRadius: "0px",
          fontFamily: "Inter, sans-serif",
          colorNeutral: "#FAF7F2",
        },
        elements: {
          card: {
            background: "#092D22",
            border: "1px solid rgba(201,169,110,0.15)",
            boxShadow: "0 0 60px rgba(201,169,110,0.05)",
          },
          formButtonPrimary: {
            background: "linear-gradient(135deg, #C9A96E, #E8D5A3, #C9A96E)",
            color: "#092D22",
            fontWeight: "600",
            borderRadius: "0",
          },
          footerActionLink: { color: "#C9A96E" },
          identityPreviewText: { color: "#FAF7F2" },
          headerTitle: {
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: "300",
          },
        },
      }}
    >
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
