/**
 * The price list, in one place. Entry price ₦10,000 a month, set by the founder on 2026-10-24; the other two
 * prices and the business limits are proposals recorded in docs/04-product/visibility-os-pricing.md.
 * A year costs ten months. Things that are not built yet are listed as coming soon and never sold as working.
 * Tests: tests/billing/plans.test.ts.
 */
export type PlanId = "STARTER" | "GROWTH" | "AGENCY";
export type Interval = "MONTHLY" | "ANNUAL";
export type Price = { amountMinor: number; currency: "NGN" };

export const PLAN_ORDER: PlanId[] = ["STARTER", "GROWTH", "AGENCY"];

export type PlanInfo = {
  name: string;
  tagline: string;
  monthlyNaira: number;
  businessLimit: number;
  /** Connecting a Google listing costs us money per use, so it starts in Growth. */
  google: boolean;
  included: string[];
  comingSoon: string[];
};

const CORE = [
  "Website and social readiness check",
  "A plan of what to fix, with progress and notes",
  "A weekly email about what changed",
  "Report history you can print",
  "Download your data any time",
];

export const PLANS: Record<PlanId, PlanInfo> = {
  STARTER: {
    name: "Starter",
    tagline: "For one business that wants to be found.",
    monthlyNaira: 10_000,
    businessLimit: 1,
    google: false,
    included: ["1 business", ...CORE],
    comingSoon: [],
  },
  GROWTH: {
    name: "Growth",
    tagline: "For owners with more than one business, or who want Google in the score.",
    monthlyNaira: 25_000,
    businessLimit: 3,
    google: true,
    included: ["Up to 3 businesses", "Everything in Starter", "Connect your Google listing: rating and reviews in your score"],
    comingSoon: ["Review tracking and reminders", "Comparison with nearby competitors"],
  },
  AGENCY: {
    name: "Agency",
    tagline: "For people who look after businesses for others.",
    monthlyNaira: 60_000,
    businessLimit: 10,
    google: true,
    included: ["Up to 10 businesses", "Everything in Growth"],
    comingSoon: ["Reports with your own name on them", "Team access", "Alerts on WhatsApp"],
  },
};

export const isPlanId = (v: unknown): v is PlanId => typeof v === "string" && (PLAN_ORDER as string[]).includes(v);
export const isInterval = (v: unknown): v is Interval => v === "MONTHLY" || v === "ANNUAL";

export const planLimit = (plan: PlanId): number => PLANS[plan].businessLimit;

/** A year is ten months of the monthly price: two months free. */
export const annualNaira = (plan: PlanId): number => PLANS[plan].monthlyNaira * 10;
export const annualSavingsNaira = (plan: PlanId): number => PLANS[plan].monthlyNaira * 2;
/** Share of the monthly-for-a-year price saved by paying yearly, rounded. */
export const annualPercentOff = (): number => Math.round((2 / 12) * 100);

/** What the provider must be paid, in kobo. The only source for amounts: the browser's number is never used. */
export function priceFor(plan: PlanId, interval: Interval): Price {
  const naira = interval === "ANNUAL" ? annualNaira(plan) : PLANS[plan].monthlyNaira;
  return { amountMinor: naira * 100, currency: "NGN" };
}

export function formatNaira(naira: number): string {
  return `₦${naira.toLocaleString("en-US")}`;
}

/** Checkout opens only when the Paystack key is set on this project. */
export function checkoutAvailable(input: { secretKey: string | undefined }): boolean {
  return Boolean(input.secretKey);
}
