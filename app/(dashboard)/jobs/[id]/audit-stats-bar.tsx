"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import type { AuditStats } from "./types";

interface AuditStatsBarProps {
  stats: AuditStats;
  pageCount: number;
}

function avgConfidenceColor(avg: number): string {
  if (avg >= 80) return "text-secondary";
  if (avg >= 60) return "text-primary";
  return "text-error";
}

export function AuditStatsBar({ stats, pageCount }: AuditStatsBarProps) {
  const t = useTranslations("JobDetail");

  const chips = [
    {
      label: t("statsTotal"),
      value: stats.totalBlocks.toString(),
      valueClass: "text-on-surface",
    },
    {
      label: t("statsAvgConfidence"),
      value: `${stats.avgConfidence}%`,
      valueClass: avgConfidenceColor(stats.avgConfidence),
    },
    {
      label: t("statsFlagged"),
      value: stats.flaggedCount.toString(),
      valueClass: stats.flaggedCount > 0 ? "text-error" : "text-secondary",
    },
    {
      label: t("statsPages"),
      value: pageCount.toString(),
      valueClass: "text-on-surface-variant",
    },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {chips.map((chip, i) => (
        <motion.div
          key={chip.label}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.2 }}
          className="flex shrink-0 flex-col rounded-xl border border-white/5 bg-surface-high px-4 py-2"
        >
          <span className="text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
            {chip.label}
          </span>
          <span className={`text-xl font-bold tabular-nums ${chip.valueClass}`}>
            {chip.value}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
