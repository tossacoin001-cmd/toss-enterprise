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
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: "#C9A96E" }}>A real scan of our own site</p>
          <p className="font-display text-2xl font-light" style={{ color: "#FAF7F2" }}>tossvisibilityos.com</p>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-5xl font-light gold-text">{view.score.kind === "number" ? view.score.value : "-"}</div>
          <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "rgba(250,247,242,0.5)" }}>out of 100</div>
        </div>
      </div>
      <p className="text-xs mb-3" style={{ color: "rgba(250,247,242,0.6)" }}>What the scan found we should fix first:</p>
      <ul className="space-y-2">
        {shown.map((f) => (
          <li key={f.id} className="action-item">
            <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: "#C9A96E" }} />
            <span className="flex-1 text-sm" style={{ color: "#FAF7F2" }}>{f.title}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] mt-4" style={{ color: "rgba(250,247,242,0.45)" }}>
        Scanned on {example.scannedAt}. Yours takes about 20 seconds.
      </p>
    </aside>
  );
}
