"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/app/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { CopyMarkdownButton } from "./copy-button";
import { AuditStatsBar } from "./audit-stats-bar";
import { RedactionBadge } from "./redaction-badge";
import { PdfPanel } from "./pdf-panel";
import { MarkdownPanel } from "./markdown-panel";
import { parseEngineBlocks, parseMarkdownBlocks } from "./parse-markdown";
import type { AuditViewProps, AuditStats, MarkdownBlock, ConfidenceTier, JobData } from "./types";

export function AuditView({ job: initialJob, documentUrl }: AuditViewProps) {
  const t = useTranslations("JobDetail");
  const tStatus = useTranslations("Status");

  // Live job state — updated by Realtime
  const [job, setJob] = useState<JobData>(initialJob);

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(1);
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceTier | "all">("all");
  const [hoveredBbox, setHoveredBbox] = useState<[number, number, number, number] | null>(null);

  // ── Supabase Realtime subscription ─────────────────────────────────────────
  useEffect(() => {
    // Only subscribe if the job is not yet in a terminal state
    if (job.status === "completed" || job.status === "failed") return;

    const supabase = createClient();
    const channel = supabase
      .channel(`job-${job.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "jobs",
          filter: `id=eq.${job.id}`,
        },
        async (payload) => {
          // Realtime payloads have a 256 KB limit — large JSONB columns like
          // structured_content may be stripped. Re-fetch the full row to be safe.
          const newStatus = (payload.new as { status?: string }).status;
          if (newStatus === "completed" || newStatus === "failed") {
            const { data } = await supabase
              .from("jobs")
              .select("*")
              .eq("id", job.id)
              .single();
            if (data) setJob(data as JobData);
          } else {
            setJob(payload.new as JobData);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [job.id, job.status]);

  // ── Derive blocks from whichever source is available ───────────────────────
  const blocks = useMemo((): MarkdownBlock[] => {
    if (job.structured_content && job.structured_content.length > 0) {
      const engineBlocks = parseEngineBlocks(job.structured_content);
      // If structured_content exists but all blocks were filtered (e.g. wrong field name),
      // fall through to output_markdown rather than showing an empty panel.
      if (engineBlocks.length > 0) return engineBlocks;
    }
    if (job.output_markdown) {
      return parseMarkdownBlocks(job.output_markdown, Math.max(1, job.page_count));
    }
    return [];
  }, [job.structured_content, job.output_markdown, job.page_count]);

  const stats: AuditStats = useMemo(
    () => ({
      totalBlocks: blocks.length,
      avgConfidence: Math.round(
        (blocks.reduce((s, b) => s + b.confidence, 0) / Math.max(1, blocks.length)) * 100
      ),
      flaggedCount: blocks.filter((b) => b.tier === "low").length,
      mediumCount: blocks.filter((b) => b.tier === "medium").length,
    }),
    [blocks]
  );

  function handleBlockClick(block: MarkdownBlock) {
    setActiveBlockId(block.id);
    setActivePage(block.pageHint);
    setHoveredBbox(block.bbox ?? null);
  }

  function handleBlockHover(block: MarkdownBlock | null) {
    if (block) {
      setActivePage(block.pageHint);
      setHoveredBbox(block.bbox ?? null);
    } else {
      setHoveredBbox(null);
    }
  }

  const hasOutput = blocks.length > 0;
  const isProcessing = job.status === "pending" || job.status === "processing";

  // Markdown string for the copy button (derived from blocks when structured)
  const markdownForCopy = useMemo(() => {
    if (job.output_markdown) return job.output_markdown;
    if (blocks.length > 0) return blocks.map((b) => b.raw).join("\n\n");
    return null;
  }, [job.output_markdown, blocks]);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-on-surface-variant transition hover:bg-white/5 hover:text-on-surface"
        >
          <ArrowLeft size={16} />
          {t("back")}
        </Link>
        <div className="flex items-center gap-3">
          <FileText size={18} className="text-on-surface-variant" />
          <h1 className="text-lg font-semibold text-on-surface">{job.file_name}</h1>
          <Badge
            variant={job.status as "processing" | "completed" | "failed" | "pending"}
          >
            {tStatus(job.status as "pending" | "processing" | "completed" | "failed")}
          </Badge>
          {isProcessing && (
            <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              {t("liveUpdates")}
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {job.redaction_summary && (
            <RedactionBadge summary={job.redaction_summary} />
          )}
          {markdownForCopy && (
            <CopyMarkdownButton markdown={markdownForCopy} />
          )}
        </div>
      </div>

      {/* Stats bar — only shown when output exists */}
      {hasOutput && <AuditStatsBar stats={stats} pageCount={job.page_count} />}

      {/* Split-screen panels */}
      <div className="grid flex-1 gap-4 overflow-hidden lg:grid-cols-2">
        <PdfPanel
          documentUrl={documentUrl}
          activePage={activePage}
          pageCount={job.page_count}
          onPageChange={setActivePage}
          activeBlockBbox={hoveredBbox}
        />

        {hasOutput ? (
          <MarkdownPanel
            blocks={blocks}
            activeBlockId={activeBlockId}
            confidenceFilter={confidenceFilter}
            onBlockClick={handleBlockClick}
            onBlockHover={handleBlockHover}
            onFilterChange={setConfidenceFilter}
          />
        ) : (
          <div className="flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-surface-lowest/60">
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
              <span className="text-sm font-medium text-on-surface-variant">
                {t("markdownOutput")}
              </span>
            </div>
            <div className="flex flex-1 items-center justify-center p-8">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-sm text-on-surface-variant">{t("processing")}</p>
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">
                  {job.status === "failed"
                    ? job.error_message || t("conversionFailed")
                    : t("noOutput")}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
