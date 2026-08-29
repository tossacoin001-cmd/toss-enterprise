import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import DashboardClient from "@/app/(dashboard)/dashboard/DashboardClient";

async function getBusiness(userId: string, businessId: string) {
  return db.business.findFirst({
    where: { id: businessId, userId },
    include: {
      visibilityScores: { orderBy: { recordedAt: "desc" }, take: 1 },
      actionItems: {
        where: { status: { not: "DONE" } },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 5,
      },
    },
  });
}

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  let business: Awaited<ReturnType<typeof getBusiness>> = null;
  try {
    business = await getBusiness(userId, id);
  } catch {
    business = null;
  }

  if (!business) notFound();

  const allBusinesses = await db.business
    .findMany({
      where: { userId },
      select: { id: true, name: true, category: true, city: true },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => [business]);

  return (
    <DashboardClient
      business={business}
      score={business.visibilityScores[0] ?? null}
      actionItems={business.actionItems}
      allBusinesses={allBusinesses}
    />
  );
}
