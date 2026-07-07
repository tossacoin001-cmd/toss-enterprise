"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface Props {
  value: string;
  label: string;
  delay?: number;
}

function parseNum(val: string): number | null {
  const match = val.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

export default function AnimatedCounter({ value, label, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState("0");

  const numeric = parseNum(value);
  const hasNumber = numeric !== null;
  const valueOnly = hasNumber ? value : value.trim();
  const prefix = hasNumber ? value.match(/^[^0-9]*/)?.[0] ?? "" : "";
  const suffix = hasNumber ? value.match(/[^0-9.]+$/)?.[0] ?? "" : "";
  const isDecimal = hasNumber && value.includes(".");

  useEffect(() => {
    if (!inView) return;
    if (!hasNumber) {
      setDisplay(valueOnly);
      return;
    }

    const timer = setTimeout(() => {
      const duration = 1800;
      const steps = 60;
      const stepTime = duration / steps;
      let step = 0;
      let interval: ReturnType<typeof setInterval> | null = null;

      interval = setInterval(() => {
        step++;
        const progress = step / steps;
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * numeric;
        setDisplay(isDecimal ? current.toFixed(1) : Math.floor(current).toString());
        if (step >= steps && interval) {
          clearInterval(interval);
          setDisplay(numeric % 1 === 0 ? numeric.toString() : numeric.toFixed(1));
        }
      }, stepTime);

      return () => {
        if (interval) clearInterval(interval);
      };
    }, delay);

    return () => clearTimeout(timer);
  }, [inView, numeric, delay, isDecimal, hasNumber, valueOnly]);

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold gold-text tabular-nums">
        {prefix}{display}{suffix}
      </div>
      <div className="text-xs tracking-[0.25em] uppercase mt-2" style={{ color: "rgba(250,247,242,0.45)" }}>
        {label}
      </div>
    </div>
  );
}
