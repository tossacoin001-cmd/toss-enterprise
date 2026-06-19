import RetainerBuilder from "@/components/RetainerBuilder";

export default function RetainerPage() {
  return (
    <>
      {/* Header */}
      <section
        className="pt-40 pb-20 px-6"
        style={{ background: "linear-gradient(180deg, #092D22 0%, #050E09 100%)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="section-line" />
            <span className="text-xs tracking-[0.35em] uppercase" style={{ color: "#C9A96E" }}>
              Monthly Retainer
            </span>
          </div>
          <h1
            className="font-display text-6xl md:text-8xl font-light leading-[1.05] mb-6"
            style={{ color: "#FAF7F2" }}
          >
            Build Your
            <br />
            <span className="gold-text italic">Retainer Plan.</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed" style={{ color: "rgba(250,247,242,0.5)" }}>
            Choose a base package and add the services your business needs. Your total updates in real time — no hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Builder */}
      <RetainerBuilder />
    </>
  );
}
