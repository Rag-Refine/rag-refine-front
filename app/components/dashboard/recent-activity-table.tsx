"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Copy,
  Download,
  Trash2,
  FileX,
} from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Badge } from "@/app/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { deleteJob } from "@/app/(dashboard)/dashboard/actions";

type Job = {
  id: string;
  file_name: string;
  file_type: string;
  status: string;
  page_count: number;
  output_markdown: string | null;
  structured_content: unknown[] | null;
  created_at: string;
};

function relativeTime(dateStr: string, labels: Record<string, string>): string {
  const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diffSec < 60) return labels.justNow;
  if (diffSec < 3600) return labels.minutesAgo.replace("{count}", String(Math.floor(diffSec / 60)));
  if (diffSec < 86400) return labels.hoursAgo.replace("{count}", String(Math.floor(diffSec / 3600)));
  if (diffSec < 604800) return labels.daysAgo.replace("{count}", String(Math.floor(diffSec / 86400)));
  return new Date(dateStr).toLocaleDateString();
}

export function RecentActivityTable({ jobs: initialJobs }: { jobs: Job[] }) {
  const t = useTranslations("Activity");
  const tStatus = useTranslations("Status");
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const timeLabels = useMemo(
    () => ({
      justNow: t("justNow"),
      minutesAgo: t("minutesAgo", { count: "{count}" }),
      hoursAgo: t("hoursAgo", { count: "{count}" }),
      daysAgo: t("daysAgo", { count: "{count}" }),
    }),
    [t]
  );

  // ── Realtime subscription ───────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("recent-activity-jobs")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "jobs" },
        (payload) => {
          setJobs((prev) =>
            prev.map((j) =>
              j.id === payload.new.id ? (payload.new as Job) : j
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "jobs" },
        (payload) => {
          setJobs((prev) => {
            // Avoid duplicates if server already included it
            if (prev.some((j) => j.id === payload.new.id)) return prev;
            return [payload.new as Job, ...prev].slice(0, 10);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Derive copyable text: prefer output_markdown, fallback to joining structured blocks
  const getMarkdownText = (job: Job): string | null => {
    if (job.output_markdown) return job.output_markdown;
    if (job.structured_content && job.structured_content.length > 0) {
      return (job.structured_content as Array<{ text?: string }>)
        .map((b) => b.text ?? "")
        .filter(Boolean)
        .join("\n\n");
    }
    return null;
  };

  const handleCopy = async (job: Job) => {
    const text = getMarkdownText(job);
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedId(job.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    const formData = new FormData();
    formData.append("job_id", jobId);
    await deleteJob({}, formData);
    router.refresh();
  };

  const handleDownload = (job: Job) => {
    const text = getMarkdownText(job);
    if (!text) return;
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = job.file_name.replace(/\.[^.]+$/, ".md");
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusLabel = (status: string) =>
    tStatus(status as "pending" | "processing" | "completed" | "failed");

  const hasContent = (job: Job) =>
    !!(job.output_markdown || (job.structured_content && job.structured_content.length > 0));

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-surface-lowest/60 px-6 py-16">
        <div className="rounded-2xl bg-surface-high p-4">
          <FileX size={28} className="text-on-surface-variant" />
        </div>
        <p className="text-sm text-on-surface-variant">
          {t("noDocuments")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface-lowest/60">
      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                {t("fileName")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                {t("status")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                {t("date")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, i) => (
              <motion.tr
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() =>
                  job.status === "completed" && router.push(`/jobs/${job.id}`)
                }
                className={`border-b border-white/5 last:border-0 ${
                  job.status === "completed"
                    ? "cursor-pointer hover:bg-white/[0.02]"
                    : ""
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-on-surface-variant" />
                    <span className="text-sm font-medium text-on-surface">
                      {job.file_name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      job.status as "processing" | "completed" | "failed" | "pending"
                    }
                  >
                    {statusLabel(job.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-on-surface-variant">
                  {relativeTime(job.created_at, timeLabels)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {job.status === "completed" && hasContent(job) && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(job);
                          }}
                          className="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-white/5 hover:text-on-surface"
                          title={t("copyMarkdown")}
                        >
                          {copiedId === job.id ? (
                            <span className="text-xs text-secondary">
                              {t("copied")}
                            </span>
                          ) : (
                            <Copy size={15} />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(job);
                          }}
                          className="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-white/5 hover:text-on-surface"
                          title={t("downloadMarkdown")}
                        >
                          <Download size={15} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(job.id);
                      }}
                      className="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-error/10 hover:text-error"
                      title={t("delete")}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="space-y-2 p-3 md:hidden">
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() =>
              job.status === "completed" && router.push(`/jobs/${job.id}`)
            }
            className={`rounded-xl border border-white/5 bg-surface-low p-4 ${
              job.status === "completed" ? "cursor-pointer" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={16} className="shrink-0 text-on-surface-variant" />
                <span className="truncate text-sm font-medium text-on-surface">
                  {job.file_name}
                </span>
              </div>
              <Badge
                variant={
                  job.status as "processing" | "completed" | "failed" | "pending"
                }
              >
                {statusLabel(job.status)}
              </Badge>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">
                {relativeTime(job.created_at, timeLabels)}
              </span>
              <div className="flex items-center gap-1">
                {job.status === "completed" && hasContent(job) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(job);
                    }}
                    className="rounded p-1 text-on-surface-variant hover:text-on-surface"
                  >
                    <Copy size={14} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(job.id);
                  }}
                  className="rounded p-1 text-on-surface-variant hover:text-error"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
