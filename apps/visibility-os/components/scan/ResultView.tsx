import Link from "next/link";
import type { ResultView as View } from "@/lib/scan-ui/view";
import ShareLinks from "./ShareLinks";
import SignUpOffer from "./SignUpOffer";

/**
 * The result, drawn from the plain data in lib/scan-ui/view.ts. A server component: a finished
 * result is readable without JavaScript. Everything is shown; nothing is locked (Decision A).
 */

const MUTED = { color: "rgba(250,247,242,0.6)" } as const;
const PRIORITY_DOT = { "Do first": "#ef4444", Soon: "#C9A96E", Later: "rgba(250,247,242,0.4)" } as const;

export default function ResultView({ view }: { view: View }) {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] tracking-[0.3em] uppercase mb-3" style={{ color: "#C9A96E" }}>
          Your free visibility check{view.ago ? `, ${view.ago}` : ""}
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-light leading-tight" style={{ color: "#FAF7F2" }}>
          {view.title}
        </h1>
      </header>

      <section className="green-card p-6 sm:p-8" aria-labelledby="first-step">
        <h2 id="first-step" className="font-display text-2xl sm:text-3xl font-light mb-3" style={{ color: "#FAF7F2" }}>
          {view.headline}
        </h2>
        {view.nextStep && (
          <>
            <p className="text-sm leading-relaxed mb-4" style={MUTED}>
              {view.nextStep.why} It takes about {view.nextStep.minutes} minutes.
            </p>
            {view.nextStep.doItForMe && (
              <a href={view.nextStep.doItForMe} target="_blank" rel="noopener noreferrer" className="btn-gold inline-flex items-center min-h-12 px-8 text-xs tracking-[0.2em] uppercase focus-visible:ring-2 focus-visible:ring-white">
                Ask Toss to do this for me
              </a>
            )}
          </>
        )}
        {view.retry && (
          <Link href="/" className="btn-gold inline-flex items-center min-h-12 px-8 text-xs tracking-[0.2em] uppercase">
            Try again
          </Link>
        )}
      </section>

      <section aria-labelledby="score-title" className="stat-card p-6">
        <h2 id="score-title" className="text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: "#C9A96E" }}>
          Your score
        </h2>
        <p className="font-display text-3xl font-light gold-text">{view.score.label}</p>
      </section>

      {view.startHere && (
        <section aria-labelledby="start-here">
          <h2 id="start-here" className="font-display text-2xl font-light mb-4" style={{ color: "#FAF7F2" }}>
            Start here
          </h2>
          <ol className="space-y-3">
            {view.startHere.map((s, i) => (
              <li key={s.id} className="action-item">
                <span className="font-display text-xl gold-text w-6 shrink-0">{i + 1}</span>
                <span className="flex-1">
                  <span className="block text-sm font-medium" style={{ color: "#FAF7F2" }}>{s.title}</span>
                  <span className="block text-xs mt-1" style={MUTED}>{s.why} About {s.minutes} minutes. {s.cost === "free" ? "Free." : "Low cost."}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {view.nextLevel.length > 0 && (
        <section aria-labelledby="next-level">
          <h2 id="next-level" className="font-display text-2xl font-light mb-4" style={{ color: "#FAF7F2" }}>
            The next level
          </h2>
          <ol className="space-y-3">
            {view.nextLevel.map((s, i) => (
              <li key={s.id} className="action-item">
                <span className="font-display text-xl gold-text w-6 shrink-0">{i + 1}</span>
                <span className="flex-1">
                  <span className="block text-sm font-medium" style={{ color: "#FAF7F2" }}>{s.title}</span>
                  <span className="block text-xs mt-1" style={MUTED}>{s.why} About {s.minutes} minutes. Free.</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {view.fixes.length > 0 && (
        <section aria-labelledby="fixes-title">
          <h2 id="fixes-title" className="font-display text-2xl font-light mb-4" style={{ color: "#FAF7F2" }}>
            What to fix, in order
          </h2>
          <ul className="space-y-3">
            {view.fixes.map((f) => (
              <li key={f.id} className="green-card p-5">
                <details>
                  <summary className="cursor-pointer min-h-11 flex items-start gap-3 list-none">
                    <span className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ background: PRIORITY_DOT[f.priority] }} aria-hidden="true" />
                    <span className="flex-1">
                      <span className="block text-sm font-medium" style={{ color: "#FAF7F2" }}>{f.title}</span>
                      <span className="block text-xs mt-1" style={MUTED}>{f.priority} · about {f.minutes} minutes</span>
                    </span>
                  </summary>
                  <div className="mt-4 space-y-4 text-sm" style={MUTED}>
                    <p>{f.why}</p>
                    <div>
                      <h3 className="text-xs tracking-[0.15em] uppercase mb-2" style={{ color: "#C9A96E" }}>Do it yourself</h3>
                      <ol className="list-decimal pl-5 space-y-1">
                        {f.steps.map((s) => (<li key={s}>{s}</li>))}
                      </ol>
                    </div>
                    {f.doItForMe && (
                      <a href={f.doItForMe} target="_blank" rel="noopener noreferrer" className="btn-outline-gold inline-flex items-center min-h-11 px-5 text-xs tracking-[0.15em] uppercase focus-visible:ring-2 focus-visible:ring-[#C9A96E]">
                        Do it for me on WhatsApp
                      </a>
                    )}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </section>
      )}

      {view.good.length > 0 && (
        <section aria-labelledby="good-title">
          <h2 id="good-title" className="font-display text-2xl font-light mb-3" style={{ color: "#FAF7F2" }}>
            What is already working
          </h2>
          <ul className="space-y-2 text-sm" style={MUTED}>
            {view.good.map((g) => (<li key={g.id}>✓ {g.title}</li>))}
          </ul>
        </section>
      )}

      {view.couldNot.length > 0 && (
        <section aria-labelledby="unchecked-title">
          <h2 id="unchecked-title" className="font-display text-2xl font-light mb-3" style={{ color: "#FAF7F2" }}>
            What we could not check
          </h2>
          {view.couldNotNote && <p className="text-sm mb-3" style={MUTED}>{view.couldNotNote}</p>}
          <ul className="space-y-3 text-sm" style={MUTED}>
            {view.couldNot.map((c) => (
              <li key={c.id}>
                <span className="block" style={{ color: "#FAF7F2" }}>{c.title}</span>
                <span className="block text-xs mt-1">{c.why}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {view.notMeasured.length > 0 && (
        <section aria-labelledby="not-measured">
          <h2 id="not-measured" className="font-display text-2xl font-light mb-3" style={{ color: "#FAF7F2" }}>
            Not measured yet
          </h2>
          <p className="text-sm mb-3" style={MUTED}>Your readiness score is about the foundations. It does not tell you how many people find you. We do not measure these yet:</p>
          <ul className="space-y-2 text-sm list-disc pl-5" style={MUTED}>
            {view.notMeasured.map((n) => (<li key={n}>{n}</li>))}
          </ul>
        </section>
      )}

      <section aria-label="Notes" className="text-xs space-y-2" style={{ color: "rgba(250,247,242,0.5)" }}>
        {view.notices.map((n) => (<p key={n}>{n}</p>))}
        <p>
          {view.canRescan
            ? "This result is more than a day old. You can check again."
            : "Results are saved for a day, so opening this page again is free and instant."}{" "}
          {view.canRescan && <Link href="/" className="underline underline-offset-4">Check again</Link>}
        </p>
      </section>

      {view.signUp.show && <SignUpOffer text={view.signUp.text} watch={view.watch.text} scanId={view.scanId} />}

      <ShareLinks text={view.share.text} path={view.share.path} />
    </div>
  );
}
