import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => undefined, refresh: () => undefined }) }));

const { default: PlanCards } = await import("@/components/plans/PlanCards");
const { PLANS, PLAN_ORDER } = await import("@/lib/billing/plans");

// What a buyer sees: three packages, honest prices, coming-soon labelled, a yearly discount, and a payment
// button that tells the truth about whether payments are open.

const html = (props: Partial<Parameters<typeof PlanCards>[0]> = {}) =>
  renderToStaticMarkup(createElement(PlanCards, { checkoutOpen: false, mode: "app", currentPlan: null, ...props }));

describe("the three packages", () => {
  it("shows all three with their monthly prices, the entry price first", () => {
    const h = html();
    for (const p of PLAN_ORDER) expect(h).toContain(PLANS[p].name);
    expect(h).toContain("₦10,000");
    expect(h).toContain("₦25,000");
    expect(h).toContain("₦60,000");
    expect(h.indexOf("₦10,000")).toBeLessThan(h.indexOf("₦25,000"));
  });

  it("says how many businesses each allows", () => {
    const h = html();
    expect(h).toContain("1 business");
    expect(h).toContain("Up to 3 businesses");
    expect(h).toContain("Up to 10 businesses");
  });

  it("shows the yearly price and the saving when yearly is chosen", () => {
    const h = html({ initialInterval: "ANNUAL" });
    expect(h).toContain("₦100,000");
    expect(h).toContain("₦250,000");
    expect(h).toContain("₦600,000");
    expect(h).toMatch(/2 months free/i);
    expect(h).toContain("₦20,000"); // saved on Starter
  });

  it("offers monthly and yearly as a clear choice", () => {
    const h = html();
    expect(h).toMatch(/aria-pressed="true"[^>]*>Monthly/);
    expect(h).toMatch(/aria-pressed="false"[^>]*>Yearly/);
  });
});

describe("coming soon is never sold as working", () => {
  it("labels every coming-soon item and says when it becomes yours", () => {
    const h = html();
    const items = PLAN_ORDER.flatMap((p) => PLANS[p].comingSoon);
    expect(items.length).toBeGreaterThan(0);
    for (const i of items) expect(h).toContain(i);
    expect((h.match(/Coming soon/g) ?? []).length).toBeGreaterThanOrEqual(items.length);
    expect(h).toMatch(/at no extra cost/i);
  });
});

describe("the payment button tells the truth", () => {
  it("while payments are closed, the app says so and nothing can be bought", () => {
    const h = html({ checkoutOpen: false, mode: "app" });
    expect(h).toMatch(/Payments open soon/);
    expect(h).not.toMatch(/Choose Starter/);
  });
  it("when payments are open, each package can be chosen", () => {
    const h = html({ checkoutOpen: true, mode: "app" });
    for (const p of PLAN_ORDER) expect(h).toContain(`Choose ${PLANS[p].name}`);
  });
  it("on the public page the way in is the free trial, never a payment", () => {
    const h = html({ mode: "public", checkoutOpen: true });
    expect(h).toMatch(/href="\/sign-up/);
    expect(h).toMatch(/Start free trial/);
    expect(h).not.toMatch(/Choose Starter/);
  });
  it("marks the package someone already has", () => {
    expect(html({ currentPlan: "GROWTH", checkoutOpen: true })).toMatch(/Your package/);
  });
});

describe("no old claims", () => {
  it("never says free while we build, early access or AI", () => {
    const h = html({ initialInterval: "ANNUAL", checkoutOpen: true });
    expect(h).not.toMatch(/early access|while we (are )?build|\bAI\b|Upgrade/i);
    expect(h).not.toMatch(/—|–/);
  });
});
