"use client";

const steps = [
  {
    number: "01",
    title: "Strategy Call",
    description:
      "We start by understanding your business, your goals, and the gaps between where you are and where you want to be. No pitching — just diagnosis.",
  },
  {
    number: "02",
    title: "System Design",
    description:
      "We map out the exact infrastructure your business needs: which systems, which technologies, what it will produce, and what the ROI looks like.",
  },
  {
    number: "03",
    title: "Build & Deploy",
    description:
      "We build fast and precisely. You see progress weekly. Every system is tested, optimized, and deployed with a 30-day performance guarantee.",
  },
  {
    number: "04",
    title: "Growth & Retain",
    description:
      "Post-launch, we offer ongoing visibility management, SEO, maintenance, and optimization retainers — so your systems keep compounding in value.",
  },
];

export default function Process() {
  return (
    <section id="process" className="py-32 px-6 relative overflow-hidden" style={{ background: "#050E09" }}>
      {/* Background text */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 font-display text-[200px] md:text-[300px] font-bold leading-none select-none pointer-events-none"
        style={{ color: "rgba(201,169,110,0.02)", letterSpacing: "-0.05em" }}
      >
        HOW
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-20 max-w-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="section-line" />
            <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>
              Our Process
            </span>
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-light leading-[1.1]" style={{ color: "#FAF7F2" }}>
            From Strategy
            <br />
            <span className="gold-text italic">To Revenue.</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-4 gap-0">
          {steps.map((s, i) => (
            <div
              key={s.number}
              className="relative group"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  className="absolute top-8 left-full w-full h-px hidden md:block z-10"
                  style={{ background: "linear-gradient(90deg, rgba(201,169,110,0.4), rgba(201,169,110,0.05))", width: "calc(100% - 20px)", left: "60px" }}
                />
              )}

              <div className="pr-8">
                {/* Number circle */}
                <div
                  className="w-16 h-16 flex items-center justify-center mb-8 relative font-display text-lg font-semibold transition-all duration-400"
                  style={{
                    border: "1px solid rgba(201,169,110,0.3)",
                    color: "#C9A96E",
                  }}
                >
                  {s.number}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                    style={{ background: "rgba(201,169,110,0.08)" }}
                  />
                </div>

                <h3
                  className="font-display text-2xl font-medium mb-4"
                  style={{ color: "#FAF7F2" }}
                >
                  {s.title}
                </h3>

                <p className="text-sm leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}>
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
