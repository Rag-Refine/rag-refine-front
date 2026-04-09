import type { MarkdownBlock, ConfidenceTier, EngineBlock } from "./types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function classifyChunk(chunk: string): MarkdownBlock["type"] {
  const trimmed = chunk.trimStart();
  if (/^#{1,6}\s/.test(trimmed)) return "heading";
  if (trimmed.startsWith("|")) return "table";
  if (trimmed.startsWith("```") || trimmed.startsWith("    ")) return "code";
  if (/^[-*+]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) return "list";
  if (trimmed.length === 0) return "other";
  return "paragraph";
}

function simulateConfidence(type: MarkdownBlock["type"], raw: string): number {
  switch (type) {
    case "table":
      return Math.min(0.75, 0.55 + (raw.length % 31) / 100);
    case "code":
      return 0.88;
    case "heading":
      return raw.length < 60 ? 0.90 : 0.85;
    case "list":
      return 0.75;
    case "paragraph":
      if (raw.length < 80) return Math.min(0.78, 0.65 + (raw.length % 15) / 100);
      if (raw.length > 300) return 0.82;
      return 0.72;
    default:
      return 0.70;
  }
}

function toTier(confidence: number): ConfidenceTier {
  if (confidence >= 0.90) return "high";
  if (confidence >= 0.70) return "medium";
  return "low";
}

function normalizeType(raw: string | undefined): MarkdownBlock["type"] {
  const map: Record<string, MarkdownBlock["type"]> = {
    heading: "heading",
    paragraph: "paragraph",
    table: "table",
    code: "code",
    list: "list",
  };
  return raw ? (map[raw] ?? "other") : "other";
}

// ── From structured_content (engine blocks) ──────────────────────────────────

export function parseEngineBlocks(blocks: EngineBlock[]): MarkdownBlock[] {
  return blocks
    .filter((b) => (b.text ?? b.markdown)?.trim())
    .map((b, i) => {
      const raw = (b.text ?? b.markdown ?? "").trim();
      const confidence = Math.min(1, Math.max(0, b.confidence_score ?? 0.72));
      return {
        id: `block-${i}`,
        type: normalizeType(b.type),
        raw,
        pageHint: b.page ?? 1,
        confidence,
        tier: toTier(confidence),
        auditNote: b.audit_note,
        bbox: b.bbox,
      };
    });
}

// ── From raw markdown string (legacy / fallback) ─────────────────────────────

interface LegacyEnvelope {
  version: string;
  blocks: Array<{
    text: string;
    page: number;
    confidence: number;
    type: string;
  }>;
}

export function parseMarkdownBlocks(
  raw: string,
  pageCount: number
): MarkdownBlock[] {
  // Attempt to parse as legacy JSON engine envelope ({ version, blocks })
  try {
    const parsed = JSON.parse(raw) as LegacyEnvelope;
    if (parsed.blocks && Array.isArray(parsed.blocks)) {
      return parsed.blocks
        .filter((b) => b.text?.trim())
        .map((b, i) => {
          const confidence = Math.min(1, Math.max(0, b.confidence ?? 0.72));
          return {
            id: `block-${i}`,
            type: normalizeType(b.type),
            raw: b.text,
            pageHint: b.page ?? 1,
            confidence,
            tier: toTier(confidence),
          };
        });
    }
  } catch {
    // not JSON — fall through to plain text parser
  }

  const chunks = raw
    .split(/\n{2,}/)
    .map((c) => c.trim())
    .filter(Boolean);

  if (chunks.length === 0) return [];

  const blocksPerPage = Math.max(
    1,
    Math.ceil(chunks.length / Math.max(1, pageCount))
  );

  return chunks.map((chunk, i) => {
    const type = classifyChunk(chunk);
    const confidence = simulateConfidence(type, chunk);
    return {
      id: `block-${i}`,
      type,
      raw: chunk,
      pageHint: Math.ceil((i + 1) / blocksPerPage),
      confidence,
      tier: toTier(confidence),
    };
  });
}
