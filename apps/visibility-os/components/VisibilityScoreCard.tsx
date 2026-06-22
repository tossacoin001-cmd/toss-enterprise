"use client";
import { motion } from "framer-motion";
import { scoreColor, formatScore } from "@/lib/utils";

interface VisibilityScoreCardProps {
  score: number;
  businessName: string;
  breakdown?: {
    google: number;
    social: number;
    website: number;
  };
}

function ScoreCircle({ score, size = 140 }: { score: number; size?: number }) {
  const strokeWidth = 7;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        className="absolute inset-0"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(201,169,110,0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      {/* Score number */}
      <div className="relative text-center">
        <motion.div
          className="font-display text-4xl font-light"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {score}
        </motion.div>
        <div className="text-[10px] tracking-wider uppercase" style={{ color: "rgba(250,247,242,0.4)" }}>
          /100
        </div>
      </div>
    </div>
  );
}

export default function VisibilityScoreCard({
  score,
  businessName,
  breakdown,
}: VisibilityScoreCardProps) {
  const label = formatScore(score);
  const color = scoreColor(score);

  return (
    <motion.div
      className="p-6 flex flex-col"
      style={{
        background: "linear-gradient(135deg, #0D3F2E, #092D22)",
        border: "1px solid rgba(201,169,110,0.15)",
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="section-line" />
        <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#C9A96E" }}>
          Visibility Score
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        <ScoreCircle score={score} />

        <div className="flex-1 min-w-0">
          <div
            className="font-display text-2xl font-light mb-0.5 truncate"
            style={{ color: "#FAF7F2" }}
          >
            {businessName}
          </div>
          <div className="text-sm font-medium mb-5" style={{ color }}>
            {label} visibility
          </div>

          {breakdown && (
            <div className="space-y-3">
              {[
                { label: "Google", value: breakdown.google },
                { label: "Social", value: breakdown.social },
                { label: "Website", value: breakdown.website },
              ].map(({ label: l, value }) => (
                <div key={l}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: "rgba(250,247,242,0.5)" }}>{l}</span>
                    <span style={{ color: scoreColor(value) }}>{value}</span>
                  </div>
                  <div
                    className="h-1 rounded-full"
                    style={{ background: "rgba(201,169,110,0.08)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: scoreColor(value) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
