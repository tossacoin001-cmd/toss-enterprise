import Link from "next/link";
import { BOOKING_URL } from "@/lib/config";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import AnimatedCounter from "@/components/AnimatedCounter";
import HomeSections from "@/components/HomeSections";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <HomeSections />

      {/* Stats */}
      <section className="py-24 px-6" style={{ background: "#092D22" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          <AnimatedCounter value="50+" label="Systems Built" delay={0} />
          <AnimatedCounter value="$2M+" label="Revenue Generated" delay={150} />
          <AnimatedCounter value="30+" label="Happy Clients" delay={300} />
          <AnimatedCounter value="100%" label="Satisfaction" delay={450} />
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-28 px-6 text-center"
        style={{ background: "#050E09", borderTop: "1px solid rgba(201,169,110,0.08)" }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="section-line" />
            <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>Ready?</span>
            <div className="section-line" />
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-light leading-[1.1] mb-6" style={{ color: "#FAF7F2" }}>
            Let&apos;s Build Your{" "}
            <span className="gold-text italic">Growth System.</span>
          </h2>
          <p className="text-sm leading-relaxed mb-10" style={{ color: "rgba(250,247,242,0.5)" }}>
            Free 30-minute strategy call. No fluff — we'll map out exactly what your business needs
            and what results it will produce.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold px-10 py-4 text-xs tracking-[0.2em] uppercase"
            >
              Book Free Strategy Call
            </a>
            <Link href="/pricing" className="btn-outline-gold px-10 py-4 text-xs tracking-[0.2em] uppercase">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
