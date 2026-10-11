"use client";

import { useState } from "react";

/** Share on WhatsApp, or copy the link. Opening a shared result runs no new scan (it is read from the saved copy). */
export default function ShareLinks({ text, path }: { text: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? path : `${window.location.origin}${path}`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy this link", url);
    }
  }
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-outline-gold inline-flex items-center min-h-11 px-5 text-xs tracking-[0.15em] uppercase focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
      >
        Share on WhatsApp
      </a>
      <button type="button" onClick={copy} className="btn-outline-gold min-h-11 px-5 text-xs tracking-[0.15em] uppercase focus-visible:ring-2 focus-visible:ring-[#C9A96E]">
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
