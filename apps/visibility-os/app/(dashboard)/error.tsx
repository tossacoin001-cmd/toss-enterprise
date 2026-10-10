"use client";
import ErrorScreen from "@/components/ErrorScreen";

export default function DashboardError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorScreen {...props} homeHref="/dashboard" homeLabel="Back to dashboard" />;
}
