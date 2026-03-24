"use client";

import { useTranslations } from "next-intl";

export function UsageBar({
  used,
  limit,
  className = "",
}: {
  used: number;
  limit: number;
  className?: string;
}) {
  const t = useTranslations("Dashboard");
  const percentage = Math.min((used / limit) * 100, 100);
  const isHigh = percentage > 80;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-high">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isHigh
                ? "bg-gradient-to-r from-error to-error-container"
                : "bg-gradient-to-r from-primary to-primary-container"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span className="whitespace-nowrap text-xs text-on-surface-variant">
        {used.toLocaleString()} / {limit.toLocaleString()} {t("pages")}
      </span>
    </div>
  );
}
