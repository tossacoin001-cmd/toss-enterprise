import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isPlacesConfigured } from "@/lib/google-places";
import { Button, EmptyState, PageHeader } from "@/components/ui";
import { serverNow } from "@/lib/workspace/clock";
import DashboardClient from "./DashboardClient";

async function getUserData(userId: string) {
  try {
    return await db.user.findUnique({
      where: { id: userId },
      include: {
        businesses: {
          orderBy: { createdAt: "desc" },
          include: {
            visibilityScores: { orderBy: { recordedAt: "desc" }, take: 1 },
            actionItems: { orderBy: [{ priority: "desc" }, { createdAt: "desc" }] },
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getUserData(userId);
  const primary = user && user.businesses.length > 0 ? user.businesses[0] : null;

  if (!primary || !user) {
    return (
      <div className="ws-stack" style={{ maxWidth: 720, margin: "0 auto" }}>
        <PageHeader title="Welcome to Visibility OS" description="Start by adding your business." />
        <EmptyState
          title="Add your first business"
          action={<Button href="/onboarding">Add your business</Button>}
        >
          Tell us your business name and where you work. We check your website and social links, and give you a short list of what to do first.
        </EmptyState>
      </div>
    );
  }

  return (
    <DashboardClient
      business={primary}
      score={primary.visibilityScores[0] ?? null}
      actions={primary.actionItems}
      allBusinesses={user.businesses}
      googleEnabled={isPlacesConfigured()}
      now={serverNow()}
    />
  );
}
