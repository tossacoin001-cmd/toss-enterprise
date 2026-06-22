import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function RootPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "linear-gradient(180deg, #092D22 0%, #050E09 60%)" }}
    >
      {/* Logo mark */}
      <div
        className="w-14 h-14 flex items-center justify-center mb-10"
        style={{ border: "1px solid rgba(201,169,110,0.3)" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" stroke="#C9A96E" strokeWidth="1.5" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="12" r="9" stroke="rgba(201,169,110,0.25)" strokeWidth="1" />
        </svg>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="section-line" />
        <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>
          Toss Enterprise
        </span>
        <div className="section-line" style={{ transform: "scaleX(-1)" }} />
      </div>

      <h1
        className="font-display text-6xl md:text-8xl font-light leading-[1.02] mb-4"
        style={{ color: "#FAF7F2" }}
      >
        Visibility<br />
        <span className="gold-text italic">OS.</span>
      </h1>

      <p
        className="text-base leading-relaxed max-w-md mb-12"
        style={{ color: "rgba(250,247,242,0.5)" }}
      >
        Your business visibility, mastered. Track Google rankings, social presence, and reputation — all in one intelligent dashboard.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/sign-up"
          className="btn-gold px-10 py-4 text-xs tracking-[0.2em] uppercase inline-block"
        >
          Start Free →
        </Link>
        <Link
          href="/sign-in"
          className="btn-outline-gold px-10 py-4 text-xs tracking-[0.2em] uppercase inline-block"
        >
          Sign In
        </Link>
      </div>

      <p className="text-xs mt-10" style={{ color: "rgba(250,247,242,0.2)" }}>
        No credit card required. Free plan available.
      </p>
    </main>
  );
}
