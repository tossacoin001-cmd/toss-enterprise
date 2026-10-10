import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center px-4"
      style={{ background: "#07160E", minHeight: "100vh" }}
    >
      <p className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: "#C9A96E" }}>
        404
      </p>
      <h1 className="font-display text-4xl font-light mb-3" style={{ color: "#FAF7F2" }}>
        We could not find that page
      </h1>
      <p className="text-sm mb-8" style={{ color: "rgba(250,247,242,0.5)" }}>
        The link may be old, or the business may have been removed.
      </p>
      <Link href="/dashboard" className="btn-gold px-5 py-2 text-xs tracking-[0.15em] uppercase">
        Go to dashboard
      </Link>
    </div>
  );
}
