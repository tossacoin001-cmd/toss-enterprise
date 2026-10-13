import { describe, expect, it } from "vitest";
import example from "@/lib/scan-ui/example-report.json";
import type { ScanReport } from "@/lib/scan";

// We practise what we preach: the example on our own front page is a saved real scan of our own
// site, and our own site must pass the checks we sell. When this test fails, either the site needs
// fixing or the saved scan is out of date. Refresh it with the real scan (see the changelog).

const report = example.report as unknown as ScanReport;
const f = (id: string) => report.findings.find((x) => x.id === id);

describe("the saved example is a real scan of our own site", () => {
  it("is of tossvisibilityos.com, dated, and reached the site", () => {
    expect(report.site?.finalUrl).toBe("https://tossvisibilityos.com/");
    expect(example.scannedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(f("site.reachable")?.state).toBe("found");
  });
});

describe("our own site passes the checks we sell", () => {
  it("every website check is found: nothing missing, nothing we could not check", () => {
    const web = report.findings.filter((x) => x.group === "website");
    expect(web.filter((x) => x.state !== "found").map((x) => `${x.id}:${x.state}`)).toEqual([]);
    expect(report.score.website).toBe(100);
  });

  it("our social links are found on the page, and none is called broken", () => {
    expect(f("social.present")?.state).toBe("found");
    expect(f("social.linked")?.state).toBe("found");
    expect(report.findings.some((x) => x.detail === "broken_link")).toBe(false);
    expect(f("social.verified")?.state).not.toBe("missing");
  });

  it("we have nothing to fix that the scan can see, so the example is not a list of our own failings", () => {
    expect(report.fixes.map((x) => x.id)).toEqual([]);
  });

  it("the overall score is high enough to be an honest advertisement", () => {
    expect(report.score.total).toBeGreaterThanOrEqual(90);
  });
});
