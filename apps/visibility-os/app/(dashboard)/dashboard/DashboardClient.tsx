"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import VisibilityScoreCard from "@/components/VisibilityScoreCard";
import { scoreColor } from "@/lib/utils";

type Business = {
  id: string;
  name: string;
  category: string | null;
  city: string | null;
};

type Score = {
  total: number;
  googleScore: number;
  socialScore: number;
  websiteScore: number;
  reviewCount: number;
  avgRating: number;
};

type ActionItem = {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  category: string | null;
};

interface DashboardClientProps {
  business: Business;
  score: Score | null;
  actionItems: ActionItem[];
  allBusinesses: Business[];
}

function priorityColor(p: string) {
  if (p === "HIGH") return "#ef4444";
  if (p === "MEDIUM") return "#C9A96E";
  return "rgba(250,247,242,0.3)";
}

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.08 },
});

export default function DashboardClient({
  business,
  score,
  actionItems,
  allBusinesses,
}: DashboardClientProps) {
  const currentScore = score?.total ?? 0;

  const stats = [
    { label: "Reviews", value: score?.reviewCount ?? "—", sub: "Google reviews" },
    { label: "Rating", value: score?.avgRating ? `${score.avgRating.toFixed(1)}★` : "—", sub: "Avg star rating" },
    { label: "Google", value: score?.googleScore ?? "—", sub: "Google score" },
    { label: "Social", value: score?.socialScore ?? "—", sub: "Social score" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div {...fadeUp(0)}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase mb-1" style={{ color: "#C9A96E" }}>
              {business.category ?? "Business"}
            </p>
            <h2
              className="font-display text-3xl font-light"
              style={{ color: "#FAF7F2" }}
            >
              {business.name}
            </h2>
            {business.city && (
              <p className="text-xs mt-0.5" style={{ color: "rgba(250,247,242,0.4)" }}>
                {business.city}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {allBusinesses.length < 3 && (
              <Link
                href="/onboarding"
                className="btn-outline-gold px-4 py-2 text-xs tracking-[0.15em] uppercase"
              >
                + Add Business
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Score + stats row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div className="lg:col-span-2" {...fadeUp(1)}>
          <VisibilityScoreCard
            score={currentScore}
            businessName={business.name}
            breakdown={
              score
                ? {
                    google: score.googleScore,
                    social: score.socialScore,
                    website: score.websiteScore,
                  }
                : undefined
            }
          />
        </motion.div>

        {/* Quick stats */}
        <motion.div className="grid grid-cols-2 gap-2 content-start" {...fadeUp(2)}>
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <div
                className="font-display text-2xl font-light"
                style={{ color: s.value === "—" ? "rgba(250,247,242,0.2)" : "#FAF7F2" }}
              >
                {s.value}
              </div>
              <div className="text-[10px] mt-1" style={{ color: "rgba(250,247,242,0.4)" }}>
                {s.sub}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Action items */}
      <motion.div {...fadeUp(3)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="section-line" />
            <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#C9A96E" }}>
              Action Items
            </span>
          </div>
          {actionItems.length > 0 && (
            <span className="badge badge-gold">{actionItems.length} open</span>
          )}
        </div>

        {actionItems.length === 0 ? (
          <div
            className="p-6 text-center"
            style={{ background: "rgba(9,45,34,0.2)", border: "1px solid rgba(201,169,110,0.07)" }}
          >
            <p className="text-xs" style={{ color: "rgba(250,247,242,0.3)" }}>
              No action items yet — your AI audit will generate a priority list here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {actionItems.map((item, i) => (
              <motion.div
                key={item.id}
                className="action-item"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                  style={{ background: priorityColor(item.priority) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium mb-0.5" style={{ color: "#FAF7F2" }}>
                    {item.title}
                  </div>
                  {item.description && (
                    <div className="text-xs leading-relaxed" style={{ color: "rgba(250,247,242,0.45)" }}>
                      {item.description}
                    </div>
                  )}
                </div>
                {item.category && (
                  <span className="badge badge-gold shrink-0">{item.category}</span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Score is zero — prompt */}
      {currentScore === 0 && (
        <motion.div
          className="p-5 flex items-center gap-5"
          style={{
            background: "rgba(201,169,110,0.05)",
            border: "1px solid rgba(201,169,110,0.15)",
          }}
          {...fadeUp(4)}
        >
          <div className="text-2xl">🔍</div>
          <div>
            <div className="text-sm font-medium mb-1" style={{ color: "#FAF7F2" }}>
              Run your first visibility audit
            </div>
            <p className="text-xs" style={{ color: "rgba(250,247,242,0.5)" }}>
              Your score will be calculated after we audit your Google Business profile, social media, and website.
            </p>
          </div>
          <button className="btn-gold px-5 py-2 text-xs tracking-[0.15em] uppercase shrink-0 ml-auto">
            Start Audit
          </button>
        </motion.div>
      )}
    </div>
  );
}
