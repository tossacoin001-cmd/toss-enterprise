import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import EditBusiness from "@/components/workspace/EditBusiness";

export default async function EditBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const { id } = await params;
  const b = await db.business.findFirst({ where: { id, userId } }).catch(() => null);
  if (!b) notFound();
  return (
    <div className="ws-stack" style={{ maxWidth: 640, margin: "0 auto" }}>
      <PageHeader title="Edit business" description={b.name} />
      <EditBusiness
        id={b.id}
        initial={{ name: b.name, category: b.category ?? "", city: b.city ?? "", website: b.website ?? "", instagramHandle: b.instagramHandle ?? "", phoneNumber: b.phoneNumber ?? "" }}
      />
    </div>
  );
}
