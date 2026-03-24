"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { FileText, Search, Copy, Trash2, FileX, AlertCircle } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { deleteJob } from "@/app/(dashboard)/dashboard/actions";

interface Job {
  id: string;
  file_name: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  error_message: string | null;
  output_markdown: string | null;
}

interface HistoryItem {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  date: Date;
  errorMessage: string | null;
  outputMarkdown: string | null;
}

type GroupedItems = { label: string; items: HistoryItem[] };

function groupByDate(items: HistoryItem[], labels: Record<string, string>): GroupedItems[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 86_400_000);
  const sevenDaysAgo = new Date(today.getTime() - 7 * 86_400_000);

  const groups: GroupedItems[] = [
    { label: labels.today, items: [] },
    { label: labels.yesterday, items: [] },
    { label: labels.lastSevenDays, items: [] },
    { label: labels.older, items: [] },
  ];

  for (const item of items) {
    const d = new Date(item.date);
    d.setHours(0, 0, 0, 0);
    if (d >= today) groups[0].items.push(item);
    else if (d >= yesterday) groups[1].items.push(item);
    else if (d >= sevenDaysAgo) groups[2].items.push(item);
    else groups[3].items.push(item);
  }

  return groups.filter((g) => g.items.length > 0);
}

function HistoryRow({
  item,
  onDelete,
}: {
  item: HistoryItem;
  onDelete: (id: string) => void;
}) {
  const t = useTranslations("History");
  const tActivity = useTranslations("Activity");
  const tStatus = useTranslations("Status");
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  const relativeTime = (date: Date): string => {
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 60) return tActivity("justNow");
    if (diffSec < 3600) return tActivity("minutesAgo", { count: String(Math.floor(diffSec / 60)) });
    if (diffSec < 86400) return tActivity("hoursAgo", { count: String(Math.floor(diffSec / 3600)) });
    if (diffSec < 604800) return tActivity("daysAgo", { count: String(Math.floor(diffSec / 86400)) });
    return date.toLocaleDateString();
  };

  const badgeVariant = item.status === "failed" ? "failed" : item.status;
  const isProcessing = item.status === "processing" || item.status === "pending";

  const handleClick = () => {
    if (item.status === "completed") {
      router.push(`/dashboard/jobs/${item.id}`);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.outputMarkdown ?? item.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
    const fd = new FormData();
    fd.append("job_id", item.id);
    startTransition(async () => {
      await deleteJob({}, fd);
    });
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
        item.status === "completed"
          ? "cursor-pointer hover:bg-white/5"
          : "hover:bg-white/[0.02]"
      }`}
    >
      {/* Icon with pulse dot for active jobs */}
      <div className="relative shrink-0">
        <FileText size={16} className="text-on-surface-variant" />
        {isProcessing && (
          <span className="absolute -right-1 -top-1 size-2 animate-pulse rounded-full bg-primary" />
        )}
      </div>

      {/* Name + meta */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-on-surface" title={item.name}>
          {item.name}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <Badge variant={badgeVariant as "completed" | "processing" | "failed" | "pending"}>
            {tStatus(badgeVariant as "completed" | "processing" | "failed" | "pending")}
          </Badge>
          <span className="text-xs text-on-surface-variant">{relativeTime(item.date)}</span>
          {item.status === "failed" && (
            <span className="group/tip relative inline-flex">
              <AlertCircle size={12} className="cursor-help text-error" />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 w-max max-w-[200px] -translate-x-1/2 rounded-lg bg-surface-high px-2.5 py-1.5 text-xs text-on-surface-variant opacity-0 shadow-lg transition-opacity group-hover/tip:opacity-100">
                {t("errorTooltip")}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Hover actions */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {item.status === "completed" && (
          <button
            onClick={handleCopy}
            title={t("actions.copy")}
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface"
          >
            {copied ? (
              <span className="text-xs text-secondary">{tActivity("copied")}</span>
            ) : (
              <Copy size={14} />
            )}
          </button>
        )}
        <button
          onClick={handleDelete}
          title={t("actions.delete")}
          className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export function SidebarHistory() {
  const t = useTranslations("History");
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;

    async function fetchJobs() {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, file_name, status, created_at, error_message, output_markdown")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!mounted) return;
      if (error) {
        setLoadError(true);
      } else {
        setJobs(data ?? []);
      }
      setLoading(false);
    }

    fetchJobs();

    const channel = supabase
      .channel("sidebar-jobs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "jobs" },
        (payload) => {
          setJobs((prev) => [payload.new as Job, ...prev].slice(0, 50));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "jobs" },
        (payload) => {
          setJobs((prev) =>
            prev.map((j) => (j.id === payload.new.id ? (payload.new as Job) : j))
          );
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleDelete = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const historyItems: HistoryItem[] = jobs.map((j) => ({
    id: j.id,
    name: j.file_name,
    status: j.status,
    date: new Date(j.created_at),
    errorMessage: j.error_message,
    outputMarkdown: j.output_markdown,
  }));

  const filtered = historyItems.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  const groups = groupByDate(filtered, {
    today: t("groups.today"),
    yesterday: t("groups.yesterday"),
    lastSevenDays: t("groups.lastSevenDays"),
    older: t("groups.older"),
  });

  if (loadError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-surface-lowest/60 p-4">
        <div className="rounded-2xl bg-surface-high p-4">
          <FileX size={24} className="text-error" />
        </div>
        <p className="text-sm text-on-surface-variant">{t("failedToLoad")}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-white/5 bg-surface-lowest/60 p-4">
      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-xl border border-white/5 bg-surface-high py-2 pl-9 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col gap-2 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-surface-high" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="rounded-2xl bg-surface-high p-4">
              <FileX size={24} className="text-on-surface-variant" />
            </div>
            <p className="text-sm text-on-surface-variant">
              {query ? t("noResults") : t("noHistory")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <section key={group.label}>
                <p className="mb-1 px-3 py-1 text-xs font-medium uppercase tracking-wider text-on-surface-variant/50">
                  {group.label}
                </p>
                <AnimatePresence initial={false}>
                  {group.items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                    >
                      <HistoryRow item={item} onDelete={handleDelete} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
