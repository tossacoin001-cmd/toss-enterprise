import type { ScanReport } from "@/lib/scan";
import { buildView } from "@/lib/scan-ui/view";
import example from "@/lib/scan-ui/example-report.json";

/**
 * A real result on the first screen: our own site, scanned by this same scan. It is a saved copy
 * of a real scan (lib/scan-ui/example-report.json, with its date), never an invented sample.
 */
export default function ExampleResult() {
  const report = example.report as unknown as ScanReport;
  const view = buildView({ id: "example", status: "done", result: report, createdAt: Date.parse(example.scannedAt) }, { now: Date.parse(example.scannedAt), name: "tossvisibilityos.com" });
  const shown = view.fixes.slice(0, 3);
  return (
    <aside className="green-card p-7" aria-label="A real example result">
      <div className="flex flex-wrap items-start justify-between mb-5 gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: "#C9A96E" }}>A real scan of our own site</p>
          <p className="font-display text-xl sm:text-2xl font-light break-words" style={{ color: "#FAF7F2" }}>tossvisibilityos.com</p>
        </div>
        <div className="shrink-0 sm:text-right">
          <div className="font-display text-5xl font-light gold-text">{view.score.kind === "number" ? view.score.value : "-"}</div>
          <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "rgba(250,247,242,0.5)" }}>Readiness score, out of 100</div>
        </div>
      </div>
      <div className="space-y-3 mb-5">
        {[
          ["Website", report.score.website],
          ["Social", report.score.social],
        ].map(([label, value]) => (
          <div key={String(label)}>
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{ color: "rgba(250,247,242,0.6)" }}>{label}</span>
              <span style={{ color: "#C9A96E" }}>{value === null ? "not checked" : String(value)}</span>
            </div>
            <div className="score-bar-track">
              <div className="score-bar-fill grow-x" style={{ width: `${typeof value === "number" ? value : 0}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs mb-3" style={{ color: "rgba(250,247,242,0.6)" }}>What the scan found we should fix first:</p>
      <ul className="space-y-2">
        {shown.map((f) => (
          <li key={f.id} className="action-item">
            <span className="tick w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: "#C9A96E" }} />
            <span className="flex-1 text-sm" style={{ color: "#FAF7F2" }}>{f.title}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] mt-4" style={{ color: "rgba(250,247,242,0.55)" }}>
        Not measured yet: how you show up in search, your reviews, and AI assistants.
      </p>
      <p className="text-[11px] mt-2" style={{ color: "rgba(250,247,242,0.45)" }}>
        Scanned on {example.scannedAt}. Yours takes about 20 seconds.
      </p>
    </aside>
  );
}
