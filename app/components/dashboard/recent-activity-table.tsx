"use client";

import { useState } from "react";
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
import { deleteJob } from "@/app/(dashboard)/dashboard/actions";

type Job = {
  id: string;
  file_name: string;
  file_type: string;
  status: string;
  page_count: number;
  output_markdown: string | null;
  created_at: string;
};

export function RecentActivityTable({ jobs }: { jobs: Job[] }) {
  const t = useTranslations("Activity");
  const tStatus = useTranslations("Status");
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const relativeTime = (dateStr: string): string => {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffSec = Math.floor((now - then) / 1000);

    if (diffSec < 60) return t("justNow");
    if (diffSec < 3600) return t("minutesAgo", { count: String(Math.floor(diffSec / 60)) });
    if (diffSec < 86400) return t("hoursAgo", { count: String(Math.floor(diffSec / 3600)) });
    if (diffSec < 604800) return t("daysAgo", { count: String(Math.floor(diffSec / 86400)) });
    return new Date(dateStr).toLocaleDateString();
  };

  const handleCopy = async (job: Job) => {
    if (!job.output_markdown) return;
    await navigator.clipboard.writeText(job.output_markdown);
    setCopiedId(job.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (jobId: string) => {
    const formData = new FormData();
    formData.append("job_id", jobId);
    await deleteJob({}, formData);
    router.refresh();
  };

  const handleDownload = (job: Job) => {
    if (!job.output_markdown) return;
    const blob = new Blob([job.output_markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = job.file_name.replace(/\.[^.]+$/, ".md");
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusLabel = (status: string) =>
    tStatus(status as "pending" | "processing" | "completed" | "failed");

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
                  job.status === "completed" &&
                  router.push(`/jobs/${job.id}`)
                }
                className={`border-b border-white/5 last:border-0 ${
                  job.status === "completed"
                    ? "cursor-pointer hover:bg-white/[0.02]"
                    : ""
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileText
                      size={18}
                      className="text-on-surface-variant"
                    />
                    <span className="text-sm font-medium text-on-surface">
                      {job.file_name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      job.status as
                        | "processing"
                        | "completed"
                        | "failed"
                        | "pending"
                    }
                  >
                    {statusLabel(job.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-on-surface-variant">
                  {relativeTime(job.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {job.status === "completed" && (
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
                  job.status as
                    | "processing"
                    | "completed"
                    | "failed"
                    | "pending"
                }
              >
                {statusLabel(job.status)}
              </Badge>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">
                {relativeTime(job.created_at)}
              </span>
              <div className="flex items-center gap-1">
                {job.status === "completed" && (
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
