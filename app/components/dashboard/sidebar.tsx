"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Clock,
  Key,
  Settings,
  HelpCircle,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Menu,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/history", label: "History", icon: Clock },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/support", label: "Support", icon: HelpCircle },
];

export function Sidebar({ accountPlan }: { accountPlan: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {navItems.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const upgradeCard = !collapsed && accountPlan === "free" && (
    <div className="mx-3 mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Zap size={16} />
        Upgrade to Pro
      </div>
      <p className="mt-1 text-xs text-on-surface-variant">
        Unlock unlimited pages and priority processing.
      </p>
      <Link
        href="/dashboard/settings"
        className="mt-3 inline-flex items-center rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/25"
      >
        View Plans
      </Link>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-surface-high p-2 text-on-surface-variant lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/5 bg-surface-lowest/95 backdrop-blur-xl lg:hidden"
            >
              <div className="flex items-center justify-between px-4 py-5">
                <span className="text-sm font-bold text-on-surface">
                  RAG-Refine
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-1 text-on-surface-variant hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>
              {nav}
              {upgradeCard}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={`hidden flex-col border-r border-white/5 bg-surface-lowest/60 backdrop-blur-xl transition-all duration-300 lg:flex ${
          collapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        <div
          className={`flex items-center px-4 py-5 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed && (
            <span className="text-sm font-bold text-on-surface">
              RAG-Refine
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-white/5 hover:text-on-surface"
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
        </div>
        {nav}
        {upgradeCard}
      </aside>
    </>
  );
}
