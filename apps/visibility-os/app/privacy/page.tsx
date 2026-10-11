import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy notice | Visibility OS",
  description: "What Visibility OS checks, what it keeps, for how long, and how to have it deleted.",
  alternates: { canonical: "/privacy" },
};

// DRAFT: written in plain language for the free instant scan. It needs a legal read against the
// Nigeria Data Protection Act 2023 and the NDPC rules before launch. See docs/04-product/visibility-os-s3-page-plan.md.
export default function Privacy() {
  return (
    <div style={{ background: "#050E09" }} className="min-h-screen">
      <article className="max-w-2xl mx-auto px-5 py-10 space-y-6 text-sm leading-relaxed" style={{ color: "rgba(250,247,242,0.75)" }}>
        <Link href="/" className="inline-flex items-center min-h-11" style={{ color: "#C9A96E" }}>← Visibility OS</Link>
        <h1 className="font-display text-4xl font-light" style={{ color: "#FAF7F2" }}>Privacy notice</h1>
        <p className="text-xs" style={{ color: "rgba(250,247,242,0.5)" }}>Draft, last updated 11 October 2026. Visibility OS is a product of Toss Enterprise.</p>

        <h2 className="font-display text-2xl font-light" style={{ color: "#FAF7F2" }}>What the free check looks at</h2>
        <p>
          When you run a free check, we look only at public information: the home page of the website you type in, the public files that
          help search engines find it (robots.txt and sitemap.xml), the security of its connection, and whether public social profiles you
          link or give us exist. We do not log in anywhere, and we do not read private messages or accounts.
        </p>

        <h2 className="font-display text-2xl font-light" style={{ color: "#FAF7F2" }}>What we keep, and for how long</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>The address you typed, the business details you chose to give (name, city, what you do, social handle, WhatsApp number), and the result of the check.</li>
          <li>We keep an unclaimed result for 30 days, then delete it. If you create an account and save it, we keep it until you delete it.</li>
          <li>We do not store your IP address or network address. To limit abuse we use a one-way code made from it that changes every day and cannot be turned back into your address or linked from one day to the next.</li>
          <li>We do not ask for your email address or card before showing your result.</li>
        </ul>

        <h2 className="font-display text-2xl font-light" style={{ color: "#FAF7F2" }}>Cookies</h2>
        <p>
          We set one essential cookie, which remembers how many new websites this browser checked today, so the free check stays fair for
          everyone. It lasts one day, holds no personal details, and the free check cannot work without it. We set no advertising cookies.
          Our safety check (Cloudflare Turnstile) runs when you start a check and may set its own technical data to tell people from
          automated programs.
        </p>

        <h2 className="font-display text-2xl font-light" style={{ color: "#FAF7F2" }}>Who sees it</h2>
        <p>
          Your result page is private to anyone who has its link; search engines are told not to list it. If you share the link, whoever
          opens it sees the result. We use these services to run the check: Vercel (hosting), Supabase (database) and Cloudflare (safety check).
          We do not sell your information.
        </p>

        <h2 className="font-display text-2xl font-light" style={{ color: "#FAF7F2" }}>Your choices</h2>
        <p>
          You can ask us to see, correct or delete what we hold about you at any time by messaging{" "}
          <a href="https://wa.me/2348087919951" className="underline underline-offset-4" style={{ color: "#C9A96E" }}>WhatsApp +234 808 791 9951</a>.
          We will reply within a few days and delete a result as soon as you send us its link.
        </p>
      </article>
    </div>
  );
}
