"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { ElementType, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

export type ButtonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  icon?: ElementType;
  href?: string;
};

const baseStyle =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20 hover:shadow-primary/40",
  secondary: "bg-surface-high border border-white/5 hover:border-primary/50 text-on-surface",
  ghost: "text-on-surface-variant hover:text-on-surface hover:bg-white/5",
};

export function Button({ children, variant = "primary", className = "", icon: Icon, href }: ButtonProps) {
  const content = (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
      {Icon && <Icon size={16} />}
    </motion.button>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
