export type ConfidenceTier = "high" | "medium" | "low";

export interface EngineBlock {
  id?: string;
  text?: string;
  markdown?: string;
  page?: number;
  bbox?: [number, number, number, number];
  type?: string;
  level?: number;
  confidence_score?: number;
  audit_note?: string;
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
