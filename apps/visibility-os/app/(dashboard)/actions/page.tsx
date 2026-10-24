import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button, EmptyState, PageHeader } from "@/components/ui";
import ActionPlan, { type ActionFilter } from "@/components/workspace/ActionPlan";
import { serverNow } from "@/lib/workspace/clock";

const FILTERS: Array<{ id: ActionFilter; label: string }> = [
  { id: "open", label: "Open" },
  { id: "done", label: "Done" },
  { id: "all", label: "All" },
];

export default async function ActionsPage({ searchParams }: { searchParams: Promise<{ business?: string; status?: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { business: businessId, status } = await searchParams;
  const filter: ActionFilter = status === "done" || status === "all" ? status : "open";

  const businesses = await db.business
    .findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: { id: true, name: true } })
    .catch(() => []);

  if (businesses.length === 0) {
    return (
      <div className="ws-stack" style={{ maxWidth: 720, margin: "0 auto" }}>
        <PageHeader title="Action plan" />
        <EmptyState title="No business yet" action={<Button href="/onboarding">Add your business</Button>}>
          Add your business and run a check, and your actions will appear here.
        </EmptyState>
      </div>
    );
  }

  const current = businesses.find((b) => b.id === businessId) ?? businesses[0];
  const items = await db.actionItem.findMany({ where: { businessId: current.id }, orderBy: [{ priority: "desc" }, { createdAt: "desc" }] }).catch(() => []);

  return (
    <div className="ws-stack" style={{ maxWidth: 800, margin: "0 auto" }}>
      <PageHeader title="Action plan" description={`What to do next for ${current.name}.`} />

      {businesses.length > 1 && (
        <nav aria-label="Business" className="ws-row">
          {businesses.map((b) => (
            <Link key={b.id} href={`/actions?business=${b.id}&status=${filter}`} className={`ws-btn ws-btn--small ${b.id === current.id ? "" : "ws-btn--secondary"}`} aria-current={b.id === current.id ? "true" : undefined}>
              {b.name}
            </Link>
          ))}
        </nav>
      )}

      <nav aria-label="Filter actions" className="ws-row">
        {FILTERS.map((f) => (
          <Link key={f.id} href={`/actions?business=${current.id}&status=${f.id}`} className={`ws-btn ws-btn--small ${f.id === filter ? "" : "ws-btn--secondary"}`} aria-current={f.id === filter ? "true" : undefined}>
            {f.label}
          </Link>
        ))}
      </nav>

      <ActionPlan key={`${current.id}-${filter}`} businessId={current.id} items={items} now={serverNow()} filter={filter} />
    </div>
  );
}
