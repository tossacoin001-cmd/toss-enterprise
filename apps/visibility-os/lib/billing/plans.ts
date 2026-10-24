/**
 * Paid plans. Prices are null on purpose: they are an owner decision and nothing is charged until they
 * are confirmed (handoff 5C). Amounts are in major units of the currency, as the provider reports them.
 */
export type PlanId = "STARTER" | "GROWTH" | "AGENCY";
export type Price = { amount: number; currency: string };

export const PLANS: Record<PlanId, { name: string; amount: number | null; currency: string | null }> = {
  STARTER: { name: "Starter", amount: null, currency: null },
  GROWTH: { name: "Growth", amount: null, currency: null },
  AGENCY: { name: "Agency", amount: null, currency: null },
};

export const isPlanId = (v: string): v is PlanId => v in PLANS;

export function planPrice(plan: PlanId): Price | null {
  const p = PLANS[plan];
  return p.amount !== null && p.currency !== null ? { amount: p.amount, currency: p.currency } : null;
}

/** Checkout opens only when at least one plan has a confirmed price and the webhook secret is set. */
export function checkoutAvailable(input: { webhookHash: string | undefined; prices?: Partial<Record<PlanId, Price>> }): boolean {
  const prices = input.prices ?? Object.fromEntries((Object.keys(PLANS) as PlanId[]).flatMap((id) => { const p = planPrice(id); return p ? [[id, p]] : []; }));
  return Boolean(input.webhookHash) && Object.keys(prices).length > 0;
}
