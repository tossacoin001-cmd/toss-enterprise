"use client";
import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
  homeHref: string;
  homeLabel: string;
};

/** Shared friendly failure screen. The digest is shown so an owner can quote
 * it to support; the raw message is never rendered. */
export default function ErrorScreen({ error, reset, homeHref, homeLabel }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-24 max-w-md mx-auto">
      <p className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: "#C9A96E" }}>
        Something went wrong
      </p>
      <h2 className="font-display text-3xl font-light mb-3" style={{ color: "#FAF7F2" }}>
        That did not load
      </h2>
      <p className="text-sm mb-8" style={{ color: "rgba(250,247,242,0.5)" }}>
        This is on our side, not yours, and your data is safe. Try again, and if it keeps
        happening, message us on WhatsApp.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <button onClick={reset} className="btn-gold px-5 py-2 text-xs tracking-[0.15em] uppercase">
          Try again
        </button>
        <Link href={homeHref} className="btn-outline-gold px-5 py-2 text-xs tracking-[0.15em] uppercase">
          {homeLabel}
        </Link>
      </div>
      {error.digest && (
        <p className="text-[10px] mt-8" style={{ color: "rgba(250,247,242,0.25)" }}>
          Reference: {error.digest}
        </p>
      )}
    </div>
  );
}
