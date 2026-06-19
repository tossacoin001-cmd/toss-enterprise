import type { Metadata } from "next";
import ProcessContent from "@/components/ProcessContent";

export const metadata: Metadata = {
  title: "Our Process — Toss Enterprise",
  description: "From strategy call to live system in weeks. A proven 4-step process: Strategy, System Design, Build & Iterate, Launch & Grow. See how Toss Enterprise works.",
};

export default function ProcessPage() {
  return <ProcessContent />;
}
