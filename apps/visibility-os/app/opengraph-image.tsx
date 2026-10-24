import { ImageResponse } from "next/og";

// The card that appears when the site is shared on WhatsApp, X or LinkedIn. Drawn from code at build
// time (no image file to download or keep), in the brand colours. Only says what the product is.
export const alt = "Visibility OS: can people find you online? A free check in 20 seconds.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(160deg, #0D3F2E 0%, #092D22 55%, #050E09 100%)", color: "#FAF7F2" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34, letterSpacing: 2, color: "#C9A96E" }}>
          <div style={{ width: 52, height: 52, border: "2px solid #C9A96E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>+</div>
          VISIBILITY OS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 96, lineHeight: 1.05, fontWeight: 500 }}>Can people find you online?</div>
          <div style={{ fontSize: 38, color: "rgba(250,247,242,0.75)" }}>A free check in 20 seconds. No sign-up.</div>
        </div>
        <div style={{ fontSize: 30, color: "#C9A96E" }}>tossvisibilityos.com</div>
      </div>
    ),
    size
  );
}
