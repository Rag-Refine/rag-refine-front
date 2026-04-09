"use client";

import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useTranslations } from "next-intl";

// Standard A4 PDF page dimensions in points (72 dpi).
// Used to map bbox coordinates (PDF space) to percentage-based overlay positions.
const PDF_PAGE_WIDTH = 595;
const PDF_PAGE_HEIGHT = 842;

interface PdfPanelProps {
  documentUrl: string | null;
  activePage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** bbox in PDF coordinate space [x1, y1, x2, y2], origin bottom-left */
  activeBlockBbox?: [number, number, number, number] | null;
}

export function PdfPanel({
  documentUrl,
  activePage,
  pageCount,
  onPageChange,
  activeBlockBbox,
}: PdfPanelProps) {
  const t = useTranslations("JobDetail");
  const safePage = Math.min(Math.max(1, activePage), Math.max(1, pageCount));
  const src = documentUrl ? `${documentUrl}#page=${safePage}` : null;

  // Convert PDF coordinate bbox to percentage overlay (origin flip: PDF y=0 is bottom)
  const overlayStyle =
    activeBlockBbox
      ? {
          left: `${(activeBlockBbox[0] / PDF_PAGE_WIDTH) * 100}%`,
          top: `${((PDF_PAGE_HEIGHT - activeBlockBbox[3]) / PDF_PAGE_HEIGHT) * 100}%`,
          width: `${((activeBlockBbox[2] - activeBlockBbox[0]) / PDF_PAGE_WIDTH) * 100}%`,
          height: `${((activeBlockBbox[3] - activeBlockBbox[1]) / PDF_PAGE_HEIGHT) * 100}%`,
        }
      : null;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-surface-lowest/60">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <FileText size={16} className="text-on-surface-variant" />
        <span className="text-sm font-medium text-on-surface-variant">
          {t("originalDocument")}
        </span>
      </div>

      <div className="relative flex-1">
        {src ? (
          <>
            <iframe
              key={safePage}
              src={src}
              className="h-full min-h-[500px] w-full"
              title={t("originalDocument")}
            />
            {/* bbox overlay — pointer-events-none so it doesn't block PDF interaction */}
            {overlayStyle && (
              <div
                className="pointer-events-none absolute border-2 border-amber-400/80 bg-amber-400/20 transition-all duration-150"
                style={overlayStyle}
              />
            )}
          </>
        ) : (
          <div className="flex h-full min-h-[500px] items-center justify-center p-8">
            <p className="text-sm text-on-surface-variant">
              {t("documentNotAvailable")}
            </p>
          </div>
        )}
      </div>

      {pageCount > 0 && (
        <div className="flex items-center justify-center gap-3 border-t border-white/5 bg-surface-lowest/90 px-4 py-2 backdrop-blur-sm">
          <button
            onClick={() => onPageChange(safePage - 1)}
            disabled={safePage <= 1}
            aria-label={t("prevPage")}
            className="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-white/5 hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-on-surface-variant">
            {t("pageOf", { current: String(safePage), total: String(pageCount) })}
          </span>
          <button
            onClick={() => onPageChange(safePage + 1)}
            disabled={safePage >= pageCount}
            aria-label={t("nextPage")}
            className="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-white/5 hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
