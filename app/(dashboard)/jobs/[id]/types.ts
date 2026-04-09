export type ConfidenceTier = "high" | "medium" | "low";

export interface EngineBlock {
  text?: string;
  markdown?: string; // some engine versions send markdown field instead of text
  page?: number;
  type?: string;
  confidence_score?: number;
  audit_note?: string;
  bbox?: [number, number, number, number]; // [x1, y1, x2, y2] in PDF coordinate space
}

export interface MarkdownBlock {
  id: string;
  type: "heading" | "paragraph" | "table" | "code" | "list" | "other";
  raw: string;
  pageHint: number;
  confidence: number;
  tier: ConfidenceTier;
  auditNote?: string;
  bbox?: [number, number, number, number]; // [x1, y1, x2, y2] in PDF coordinate space
}

export interface AuditStats {
  totalBlocks: number;
  avgConfidence: number;
  flaggedCount: number;
  mediumCount: number;
}

export interface JobData {
  id: string;
  file_name: string;
  status: "pending" | "processing" | "completed" | "failed";
  output_markdown: string | null;
  structured_content: EngineBlock[] | null;
  storage_path: string | null;
  page_count: number;
  error_message: string | null;
  created_at: string;
}

export interface AuditViewProps {
  job: JobData;
  documentUrl: string | null;
}
