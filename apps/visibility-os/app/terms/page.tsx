import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms | Visibility OS",
  description: "The simple terms for using the Visibility OS free check.",
  alternates: { canonical: "/terms" },
};

// DRAFT: plain-language terms for the free instant scan. Needs a legal read before launch.
export default function Terms() {
  return (
    <div style={{ background: "#050E09" }} className="min-h-screen">
      <article className="max-w-2xl mx-auto px-5 py-10 space-y-6 text-sm leading-relaxed" style={{ color: "rgba(250,247,242,0.75)" }}>
        <Link href="/" className="inline-flex items-center min-h-11" style={{ color: "#C9A96E" }}>← Visibility OS</Link>
        <h1 className="font-display text-4xl font-light" style={{ color: "#FAF7F2" }}>Terms</h1>
        <p className="text-xs" style={{ color: "rgba(250,247,242,0.5)" }}>Draft, last updated 11 October 2026. Visibility OS is a product of Toss Enterprise.</p>

        <h2 className="font-display text-2xl font-light" style={{ color: "#FAF7F2" }}>The free check</h2>
        <p>
          The free check is offered as it is, to help you see how visible a business is online. It looks only at public information, so it
          can miss things (for example, parts of a page that appear only after scripts run) and it says so when it could not check
          something. It is guidance, not a guarantee of results, rankings or sales.
        </p>

        <h2 className="font-display text-2xl font-light" style={{ color: "#FAF7F2" }}>Fair use</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Check your own business, or one you have a good reason to look at. The check reads public pages only.</li>
          <li>There are daily limits. Please do not try to get around them or use the check to send heavy traffic to other people&apos;s websites.</li>
          <li>Do not type in anything unlawful or anything that is not a website address or business detail.</li>
        </ul>

        <h2 className="font-display text-2xl font-light" style={{ color: "#FAF7F2" }}>Your information</h2>
        <p>
          How we handle your information is in our <Link href="/privacy" className="underline underline-offset-4" style={{ color: "#C9A96E" }}>privacy notice</Link>.
          Results you do not save are deleted after 30 days.
        </p>

        <h2 className="font-display text-2xl font-light" style={{ color: "#FAF7F2" }}>Paid help</h2>
        <p>
          If you ask Toss Enterprise to do a fix for you, we will agree the work and the price with you first, in writing, before you pay.
          Nothing in the free check charges you.
        </p>

        <h2 className="font-display text-2xl font-light" style={{ color: "#FAF7F2" }}>Questions</h2>
        <p>
          Message us on{" "}
          <a href="https://wa.me/2348087919951" className="underline underline-offset-4" style={{ color: "#C9A96E" }}>WhatsApp +234 808 791 9951</a>.
        </p>
      </article>
    </div>
  );
}
