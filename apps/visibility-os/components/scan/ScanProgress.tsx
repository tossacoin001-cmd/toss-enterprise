"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { pollDecision, pollDelayMs } from "@/lib/scan-ui/poll";
import { progressStep } from "@/lib/scan-ui/view";

/**
 * The waiting screen. Asks the server gently (slower over time, paused while the tab is hidden)
 * and refreshes the page when the scan ends, so the finished result is the server-rendered one.
 * Tests: tests/scan-ui/poll-and-typos.test.ts, structure.test.ts.
 */
export default function ScanProgress({ id, startedAt }: { id: string; startedAt: number }) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    const tick = setInterval(() => setElapsed(Math.max(0, Date.now() - startedAt)), 500);
    return () => clearInterval(tick);
  }, [startedAt]);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;

    async function poll() {
      if (stopped) return;
      const elapsedMs = Math.max(0, Date.now() - startedAt);
      const hidden = document.visibilityState === "hidden";
      const before = pollDecision({ status: "running", elapsedMs, hidden });
      if (before === "give_up") return setGaveUp(true);
      if (before === "pause") return; // the visibilitychange listener resumes
      let status: "running" | "done" | "incomplete" = "running";
      try {
        const res = await fetch(`/api/scan/${id}`, { cache: "no-store" });
        if (res.ok) status = ((await res.json()) as { status: typeof status }).status;
      } catch {
        /* a dropped connection: try again on the next beat */
      }
      if (pollDecision({ status, elapsedMs: Date.now() - startedAt, hidden: false }) === "stop") return router.refresh();
      timer = setTimeout(poll, pollDelayMs(attempt++));
    }

    const resume = () => {
      if (document.visibilityState === "visible" && !stopped) {
        clearTimeout(timer);
        poll();
      }
    };
    document.addEventListener("visibilitychange", resume);
    timer = setTimeout(poll, pollDelayMs(attempt++));
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [id, router, startedAt]);

  const step = progressStep(elapsed);
  return (
    <div className="green-card p-8 text-center" role="status" aria-live="polite">
      <p className="font-display text-2xl font-light mb-3" style={{ color: "#FAF7F2" }}>
        {gaveUp ? "This is taking longer than usual" : step.label}
      </p>
      <p className="text-sm" style={{ color: "rgba(250,247,242,0.6)" }}>
        {gaveUp ? "Your result is not lost. Open this page again in a minute, or start a new check." : "Most checks take under 20 seconds. You can keep this page open."}
      </p>
      {gaveUp && (
        <Link href="/" className="btn-gold inline-flex items-center min-h-12 px-8 mt-6 text-xs tracking-[0.2em] uppercase">
          Start a new check
        </Link>
      )}
    </div>
  );
}
