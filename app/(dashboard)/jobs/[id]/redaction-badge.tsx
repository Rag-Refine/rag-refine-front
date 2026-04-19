"use client";

import { useState } from "react";
import { Shield, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { RedactionSummary } from "./types";

interface RedactionBadgeProps {
  summary: RedactionSummary | null;
}

const LABELS: Record<string, string> = {
  EMAIL: "Emails",
  IBAN: "IBANs",
  SWIFT: "SWIFT/BIC",
  CREDIT_CARD: "Credit cards",
  PT_NIF: "PT NIF",
  PT_CC: "PT CC",
  PT_NISS: "PT NISS",
  ES_DNI: "ES DNI/NIE",
  FR_TIN: "FR TIN",
  PASSPORT: "Passports",
  PHONE: "Phones",
  ZIP: "Postal codes",
  NAME: "Names",
  ADDRESS: "Addresses (labeled)",
  STREET: "Street lines",
  FLOOR: "Floor / door",
};

export function RedactionBadge({ summary }: RedactionBadgeProps) {
  const t = useTranslations("JobDetail");
  const [open, setOpen] = useState(false);

  if (!summary) return null;

  const total = summary.total ?? 0;
  const clean = total === 0;
  const Icon = clean ? ShieldCheck : Shield;

  const appliedEntries = Object.entries(summary.applied ?? {}).sort(
    (a, b) => b[1] - a[1],
  );
  const missedTotal = Object.values(summary.missed ?? {}).reduce(
    (sum, n) => sum + n,
    0,
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
          clean
            ? "border-secondary/30 bg-secondary/10 text-secondary"
            : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
        }`}
        aria-expanded={open}
      >
        <Icon size={12} />
        {clean
          ? t("redactionClean")
          : t("redactionCount", { count: String(total) })}
      </button>

      {open && !clean && (
        <div
          className="absolute right-0 top-full z-10 mt-2 w-64 rounded-xl border border-white/10 bg-surface-high p-3 shadow-xl"
          onMouseLeave={() => setOpen(false)}
        >
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
            {t("redactionBreakdown")}
          </p>
          <ul className="space-y-1">
            {appliedEntries.map(([kind, count]) => (
              <li
                key={kind}
                className="flex items-center justify-between text-xs text-on-surface"
              >
                <span>{LABELS[kind] ?? kind}</span>
                <span className="font-semibold tabular-nums">{count}</span>
              </li>
            ))}
          </ul>
          {missedTotal > 0 && (
            <p className="mt-3 border-t border-white/5 pt-2 text-[11px] text-on-surface-variant">
              {t("redactionMissed", { count: String(missedTotal) })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
