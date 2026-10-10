"use client";
import ErrorScreen from "@/components/ErrorScreen";

export default function RootError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ background: "#07160E", minHeight: "100vh" }}>
      <ErrorScreen {...props} homeHref="/" homeLabel="Go home" />
    </div>
  );
}
