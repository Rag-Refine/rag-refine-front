"use client";

import type { ReactNode } from "react";

type Variant = "processing" | "completed" | "failed" | "pending";

const variants: Record<Variant, string> = {
  processing: "bg-primary/15 text-primary border-primary/20",
  completed: "bg-secondary/15 text-secondary border-secondary/20",
  failed: "bg-error/15 text-error border-error/20",
  pending: "bg-on-surface-variant/15 text-on-surface-variant border-on-surface-variant/20",
};

const dots: Record<Variant, string> = {
  processing: "bg-primary",
  completed: "bg-secondary",
  failed: "bg-error",
  pending: "bg-on-surface-variant",
};

export function Badge({
  variant = "pending",
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${dots[variant]} ${variant === "processing" ? "animate-pulse" : ""}`}
      />
      {children}
    </span>
  );
}
