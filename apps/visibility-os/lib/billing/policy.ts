/**
 * The one place that says what an account may do. Every limit the app enforces or shows comes from here,
 * so the page, the API and the settings screen can never disagree. Extended with trial and access states
 * in lib/billing/entitlements.ts. Tests: tests/billing.
 */

/** Businesses one account may have. Shown and enforced from this single value. */
export const BUSINESS_LIMIT = 3;
