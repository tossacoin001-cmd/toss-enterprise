import type { Metadata } from "next";
import WorkContent from "@/components/WorkContent";

export const metadata: Metadata = {
  title: "Our Work | Toss Enterprise",
  description: "Live systems across fashion, food, luxury, sports, and SaaS. Real work, real results, engineered by Toss Enterprise for ambitious brands worldwide.",
};

export default function WorkPage() {
  return <WorkContent />;
}
