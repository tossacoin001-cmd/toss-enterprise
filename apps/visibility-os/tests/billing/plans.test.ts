import { describe, expect, it } from "vitest";
import { PLANS, PLAN_ORDER, annualSavingsNaira, checkoutAvailable, formatNaira, isInterval, isPlanId, planLimit, priceFor } from "@/lib/billing/plans";

// The price list, in one place. Entry price N10,000 a month (founder, 2026-10-24); three packages; a yearly
// discount of two months free; coming-soon items sit in the higher packages. Tests: this file.

describe("the price list", () => {
  it("has three packages in order, cheapest first", () => {
    expect(PLAN_ORDER).toEqual(["STARTER", "GROWTH", "AGENCY"]);
    const monthly = PLAN_ORDER.map((p) => PLANS[p].monthlyNaira);
    expect([...monthly].sort((a, b) => a - b)).toEqual(monthly);
  });

  it("starts at N10,000 a month", () => {
    expect(PLANS.STARTER.monthlyNaira).toBe(10_000);
    expect(formatNaira(10_000)).toBe("₦10,000");
  });

  it("charges ten months for a year, and says what that saves", () => {
    for (const p of PLAN_ORDER) {
      expect(priceFor(p, "ANNUAL").amountMinor).toBe(PLANS[p].monthlyNaira * 10 * 100);
      expect(annualSavingsNaira(p)).toBe(PLANS[p].monthlyNaira * 2);
    }
    expect(priceFor("STARTER", "MONTHLY")).toEqual({ amountMinor: 1_000_000, currency: "NGN" });
    expect(priceFor("STARTER", "ANNUAL")).toEqual({ amountMinor: 10_000_000, currency: "NGN" });
  });

  it("a year is always cheaper per month than paying monthly", () => {
    for (const p of PLAN_ORDER) expect(priceFor(p, "ANNUAL").amountMinor / 12).toBeLessThan(priceFor(p, "MONTHLY").amountMinor);
  });

  it("business limits grow with the package", () => {
    expect(PLAN_ORDER.map((p) => planLimit(p))).toEqual([1, 3, 10]);
  });

  it("only the higher packages connect Google, because it costs us per use", () => {
    expect(PLANS.STARTER.google).toBe(false);
    expect(PLANS.GROWTH.google).toBe(true);
    expect(PLANS.AGENCY.google).toBe(true);
  });

  it("coming-soon items sit in the higher packages only, never in Starter", () => {
    expect(PLANS.STARTER.comingSoon).toEqual([]);
    expect(PLANS.GROWTH.comingSoon.length).toBeGreaterThan(0);
    expect(PLANS.AGENCY.comingSoon.length).toBeGreaterThan(0);
  });

  it("nothing is listed as both working now and coming soon", () => {
    const all = PLAN_ORDER.flatMap((p) => [...PLANS[p].included.map((i) => ({ i, k: "now" })), ...PLANS[p].comingSoon.map((i) => ({ i, k: "soon" }))]);
    const names = all.map((x) => x.i.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it("uses plain words: no dashes in sentences, no jargon", () => {
    const text = PLAN_ORDER.flatMap((p) => [PLANS[p].tagline, ...PLANS[p].included, ...PLANS[p].comingSoon]).join(" ");
    expect(text).not.toMatch(/—|–/);
    expect(text).not.toMatch(/\bAI\b|\bAPI\b|SEO|synerg/i);
  });
});

describe("checking what we are asked for", () => {
  it("knows real plans and intervals only", () => {
    expect(isPlanId("GROWTH")).toBe(true);
    expect(isPlanId("FREE")).toBe(false);
    expect(isPlanId("PLATINUM")).toBe(false);
    expect(isInterval("MONTHLY")).toBe(true);
    expect(isInterval("ANNUAL")).toBe(true);
    expect(isInterval("WEEKLY")).toBe(false);
  });
});

describe("checkout availability", () => {
  it("is closed without the payment key, open with it", () => {
    expect(checkoutAvailable({ secretKey: undefined })).toBe(false);
    expect(checkoutAvailable({ secretKey: "" })).toBe(false);
    expect(checkoutAvailable({ secretKey: "sk_test_x" })).toBe(true);
  });
});

describe("formatNaira", () => {
  it("groups thousands", () => {
    expect(formatNaira(250_000)).toBe("₦250,000");
    expect(formatNaira(0)).toBe("₦0");
  });
});
