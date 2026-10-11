import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ResultView from "@/components/scan/ResultView";
import ScanProgress from "@/components/scan/ScanProgress";
import { db } from "@/lib/db";
import { prismaStore } from "@/lib/scan-limits/prisma-store";
import { getScan } from "@/lib/scan-limits/service";
import type { ScanReport } from "@/lib/scan";
import { buildView, type ScanApi } from "@/lib/scan-ui/view";

// A result is private to whoever has the link: not indexed, no referrer, never in a sitemap.
export const metadata: Metadata = {
  title: "Your visibility check | Visibility OS",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export const dynamic = "force-dynamic";

// Read per request on purpose: a result shows how old it is.
const currentTime = (): number => Date.now();

export default async function ScanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const now = currentTime();
  const got = await getScan(id, { store: prismaStore(db), now: () => now });
  if (got.status === 404) notFound();

  if (got.status !== 200) {
    return (
      <Shell>
        <div className="green-card p-8 text-center">
          <h1 className="font-display text-3xl font-light mb-3" style={{ color: "#FAF7F2" }}>We could not open this result</h1>
          <p className="text-sm mb-6" style={{ color: "rgba(250,247,242,0.6)" }}>Something went wrong on our side. Please try again in a minute.</p>
          <Link href={`/scan/${id}`} className="btn-gold inline-flex items-center min-h-12 px-8 text-xs tracking-[0.2em] uppercase">Try again</Link>
        </div>
      </Shell>
    );
  }

  const api = got.body as ScanApi;
  const meta = (api.result as ScanReport | null)?.meta;
  const view = buildView(api, { now, name: meta?.name, city: meta?.city, category: meta?.category });

  return (
    <Shell>
      {view.state === "running" ? (
        <>
          <h1 className="font-display text-4xl font-light mb-8" style={{ color: "#FAF7F2" }}>{view.headline}</h1>
          <ScanProgress id={api.id} startedAt={api.createdAt} />
        </>
      ) : (
        <ResultView view={view} />
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "linear-gradient(180deg, #092D22 0%, #050E09 55%)" }} className="min-h-screen">
      <div className="max-w-3xl mx-auto px-5 py-8 sm:py-12">
        <Link href="/" className="inline-flex items-center min-h-11 text-sm mb-8" style={{ color: "#C9A96E" }}>
          ← Visibility OS
        </Link>
        {children}
      </div>
    </div>
  );
}
