import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Notice, PageHeader } from "@/components/ui";
import DataControls from "@/components/workspace/DataControls";
import { db } from "@/lib/db";
import { getAccess, trialEnforced } from "@/lib/billing/access";
import { BUSINESS_LIMIT } from "@/lib/billing/policy";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Display-only details: a Clerk network blip must not take the page down.
  const clerkUser = await currentUser().catch(() => null);
  const prefs = await db.user.findUnique({ where: { id: userId }, select: { digestOptOut: true } }).catch(() => null);
  const access = await getAccess(userId).catch(() => null);
  const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ");

  return (
    <div className="ws-stack" style={{ maxWidth: 720, margin: "0 auto" }}>
      <PageHeader title="Settings" description="Your account, your access and your data." />

      <section className="ws-card" aria-labelledby="account-title">
        <h2 id="account-title" className="ws-h2">Account</h2>
        <dl className="ws-stack" style={{ marginTop: "0.6rem" }}>
          <div>
            <dt className="ws-muted ws-small">Name</dt>
            <dd style={{ margin: 0 }}>{name || "Not set"}</dd>
          </div>
          <div>
            <dt className="ws-muted ws-small">Email</dt>
            <dd style={{ margin: 0, overflowWrap: "anywhere" }}>{clerkUser?.emailAddresses[0]?.emailAddress ?? "Not available"}</dd>
          </div>
        </dl>
      </section>

      <section className="ws-card" aria-labelledby="access-title">
        <h2 id="access-title" className="ws-h2">Your access</h2>
        {access ? (
          <>
            <p style={{ marginTop: "0.6rem", fontWeight: 600 }}>{access.label}</p>
            <p className="ws-muted ws-small">{access.detail}</p>
            {!access.canMutate && !trialEnforced() ? (
              <p className="ws-muted ws-small" style={{ marginTop: "0.4rem" }}>Nothing is paused for now. Paid plans are not on sale yet, so changes stay open.</p>
            ) : null}
          </>
        ) : (
          <p style={{ marginTop: "0.6rem" }}>We could not load your access details just now. Your data is safe. Please refresh in a moment.</p>
        )}
        <ul className="ws-muted ws-small" style={{ marginTop: "0.6rem", paddingLeft: "1.2rem" }}>
          <li>Up to {BUSINESS_LIMIT} businesses.</li>
          <li>A check of your website and social links, a list of what to do, and a weekly email about what changed.</li>
        </ul>
        <div style={{ marginTop: "0.8rem" }}>
          <Notice tone="info">Paid plans are not on sale yet. We will tell you before anything changes, and we will never charge you without your say.</Notice>
        </div>
      </section>

      <section className="ws-card" aria-labelledby="data-title">
        <h2 id="data-title" className="ws-h2">Your data</h2>
        <p className="ws-muted ws-small" style={{ marginTop: "0.4rem" }}>
          We keep your businesses, your checks and your actions so you can see your progress. We never sell your information. Read the <Link href="/privacy" className="ws-link">privacy notice</Link>.
        </p>
        <DataControls weeklyEmail={!(prefs?.digestOptOut ?? false)} />
        <p className="ws-muted ws-small" style={{ marginTop: "0.8rem" }}>
          Questions about your data? Message us on <a className="ws-link" href="https://wa.me/2348087919951">WhatsApp +234 808 791 9951</a>.
        </p>
      </section>
    </div>
  );
}
