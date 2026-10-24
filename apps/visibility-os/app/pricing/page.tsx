import Link from "next/link";
import PlanCards from "@/components/plans/PlanCards";
import { PageHeader } from "@/components/ui";

export default function PricingPage() {
  return (
    <main id="main" className="ws-stack" style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 16px 3rem" }}>
      <PageHeader title="Pricing" description="Simple prices in naira. Start with a free 7-day trial. No card is needed." />
      <PlanCards mode="public" checkoutOpen={false} currentPlan={null} />
      <p className="ws-small ws-muted">
        Not ready? <Link href="/" className="ws-link">Check your business for free</Link>, no sign-up needed. Read our <Link href="/privacy" className="ws-link">privacy notice</Link> and <Link href="/terms" className="ws-link">terms</Link>.
      </p>
    </main>
  );
}
