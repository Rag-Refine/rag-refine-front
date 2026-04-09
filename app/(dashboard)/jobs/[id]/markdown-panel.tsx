"use client";

import { useEffect, useMemo, useRef } from "react";
import { AlertTriangle, Code2 } from "lucide-react";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { MarkdownBlock, ConfidenceTier } from "./types";

// ── Confidence-tier indicators ────────────────────────────────────────────────

const TIER_BORDER: Record<ConfidenceTier, string> = {
  high: "border-l-green-400",
  medium: "border-l-amber-400",
  low: "border-l-red-400",
};

const TIER_BADGE_BG: Record<ConfidenceTier, string> = {
  high: "bg-green-50 text-green-700",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-red-50 text-red-700",
};

// ── Filter options (static — outside component) ───────────────────────────────

type FilterOption = ConfidenceTier | "all";

const FILTER_OPTIONS: FilterOption[] = ["all", "high", "medium", "low"];

// ── Page separator ────────────────────────────────────────────────────────────

function PageSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 select-none">
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

// ── Block item renderer ───────────────────────────────────────────────────────

interface BlockItemProps {
  block: MarkdownBlock;
  isActive: boolean;
  typeLabel: string;
  onClick: () => void;
  onHover: (block: MarkdownBlock | null) => void;
}

function BlockItem({ block, isActive, typeLabel, onClick, onHover }: BlockItemProps) {
  return (
    <div
      id={block.id}
      onClick={onClick}
      onMouseEnter={() => onHover(block)}
      onMouseLeave={() => onHover(null)}
      className={`
        group relative cursor-pointer rounded border-l-4 pl-2 pr-3 py-1.5
        transition-colors hover:bg-black/[0.03]
        ${TIER_BORDER[block.tier]}
        ${isActive ? "bg-black/[0.05] ring-1 ring-inset ring-black/10" : ""}
      `}
    >
      {/* Always-visible badge — type + confidence */}
      <div className="absolute top-1 right-1 z-10 flex items-center gap-1 pointer-events-none">
        <span className={`rounded px-1 py-0.5 text-[10px] font-medium leading-none ${TIER_BADGE_BG[block.tier]}`}>
          {typeLabel}
        </span>
        <span className={`rounded px-1 py-0.5 text-[10px] font-medium leading-none ${TIER_BADGE_BG[block.tier]}`}>
          {Math.round(block.confidence * 100)}%
        </span>
      </div>

      {/* Hover tooltip — page number */}
      <div className="absolute top-full left-0 z-20 flex items-center gap-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-100 mt-0.5">
        <span className="rounded bg-gray-800/95 px-1.5 py-0.5 text-[10px] font-medium text-gray-100 shadow-lg border border-white/8 whitespace-nowrap">
          p.{block.pageHint}
        </span>
      </div>

      {/* Content — pt-4 clears the badge */}
      <div className="min-w-0 pt-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            table: ({ children }) => (
              <div className="overflow-x-auto my-1">
                <table className="w-full border-collapse text-xs">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => <tr className="even:bg-gray-50">{children}</tr>,
            th: ({ children }) => (
              <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-800 text-xs">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-gray-300 px-2 py-1 text-gray-700 text-xs">
                {children}
              </td>
            ),
            h1: ({ children }) => (
              <h1 className="text-base font-bold text-gray-900 leading-snug">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-sm font-bold text-gray-900 leading-snug">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-semibold text-gray-800 leading-snug">{children}</h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-xs font-semibold text-gray-800">{children}</h4>
            ),
            h5: ({ children }) => (
              <h5 className="text-xs font-medium text-gray-700">{children}</h5>
            ),
            h6: ({ children }) => <h6 className="text-xs text-gray-700">{children}</h6>,
            p: ({ children }) => (
              <p className="text-xs leading-relaxed text-gray-800">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-4 text-xs text-gray-800 space-y-0.5">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-4 text-xs text-gray-800 space-y-0.5">{children}</ol>
            ),
            li: ({ children }) => <li>{children}</li>,
            code: ({ children }) => (
              <code className="bg-gray-100 px-0.5 rounded text-xs font-mono">{children}</code>
            ),
            pre: ({ children }) => (
              <pre className="bg-gray-100 rounded p-2 text-xs font-mono overflow-x-auto my-1">
                {children}
              </pre>
            ),
          }}
        >
          {block.raw}
        </ReactMarkdown>
      </div>

      {/* Inline audit note */}
      {block.auditNote && (
        <div className="mt-1.5 flex items-start gap-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-1.5">
          <AlertTriangle size={11} className="mt-0.5 shrink-0 text-amber-500" />
          <span className="text-[10px] leading-snug text-amber-700">{block.auditNote}</span>
        </div>
      )}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

interface MarkdownPanelProps {
  blocks: MarkdownBlock[];
  activeBlockId: string | null;
  confidenceFilter: FilterOption;
  onBlockClick: (block: MarkdownBlock) => void;
  onBlockHover: (block: MarkdownBlock | null) => void;
  onFilterChange: (filter: FilterOption) => void;
}

export function MarkdownPanel({
  blocks,
  activeBlockId,
  confidenceFilter,
  onBlockClick,
  onBlockHover,
  onFilterChange,
}: MarkdownPanelProps) {
  const t = useTranslations("JobDetail");
  const activeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeBlockId) {
      activeRef.current = null;
      return;
    }
    if (activeBlockId !== activeRef.current) {
      activeRef.current = activeBlockId;
      document
        .getElementById(activeBlockId)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeBlockId]);

  const counts = useMemo(
    () => ({
      all: blocks.length,
      high: blocks.filter((b) => b.tier === "high").length,
      medium: blocks.filter((b) => b.tier === "medium").length,
      low: blocks.filter((b) => b.tier === "low").length,
    }),
    [blocks]
  );

  const filtered = useMemo(
    () =>
      confidenceFilter === "all" ? blocks : blocks.filter((b) => b.tier === confidenceFilter),
    [blocks, confidenceFilter]
  );

  const pageGroups = useMemo(() => {
    const map = new Map<number, MarkdownBlock[]>();
    for (const block of filtered) {
      const existing = map.get(block.pageHint);
      if (existing) existing.push(block);
      else map.set(block.pageHint, [block]);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([page, pageBlocks]) => ({ page, pageBlocks }));
  }, [filtered]);

  const filterLabels: Record<FilterOption, string> = {
    all: t("filterAll"),
    high: t("filterHigh"),
    medium: t("filterMedium"),
    low: t("filterLow"),
  };

  const typeLabels: Record<MarkdownBlock["type"], string> = {
    heading: t("blockTypeHeading"),
    paragraph: t("blockTypeParagraph"),
    table: t("blockTypeTable"),
    code: t("blockTypeCode"),
    list: t("blockTypeList"),
    other: t("blockTypeOther"),
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-surface-lowest/60">
      {/* Panel header */}
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <Code2 size={16} className="text-on-surface-variant" />
        <span className="text-sm font-medium text-on-surface-variant">
          {t("markdownOutput")}
        </span>

        {/* Filter chips */}
        <div className="ml-auto flex gap-1">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => onFilterChange(opt)}
              className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                confidenceFilter === opt
                  ? "bg-surface-high text-on-surface"
                  : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
              }`}
            >
              {filterLabels[opt]}
              <span className="ml-1 opacity-50">({counts[opt]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Document viewer — paper background */}
      <div
        className="flex-1 overflow-auto bg-white"
        onMouseLeave={() => onBlockHover(null)}
      >
        {filtered.length === 0 ? (
          <div className="flex h-full min-h-[200px] items-center justify-center p-8">
            <p className="text-sm text-gray-400">{t("noBlocks")}</p>
          </div>
        ) : (
          <div className="py-4 px-2">
            {pageGroups.map(({ page, pageBlocks }) => (
              <div key={page} className="mb-2">
                <PageSeparator label={t("pageSeparator", { page: String(page) })} />
                {pageBlocks.map((block) => (
                  <BlockItem
                    key={block.id}
                    block={block}
                    isActive={activeBlockId === block.id}
                    typeLabel={typeLabels[block.type]}
                    onClick={() => onBlockClick(block)}
                    onHover={onBlockHover}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
