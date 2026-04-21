import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";

type EngineBlock = {
  id?: string;
  text?: string;
  markdown?: string;
  page?: number;
  bbox?: [number, number, number, number];
  type?: string;
  level?: number;
  confidence_score?: number;
  audit_note?: string;
};

type CallbackBody = {
  job_id?: string;
  status?: string;
  // Structured blocks — accept any of these field names
  content?: EngineBlock[];
  blocks?: EngineBlock[];
  result?: EngineBlock[];
  // Plain markdown string — accept any of these field names
  markdown?: string;
  output?: string;
  text?: string;
  output_markdown?: string;
  // Metadata and error
  metadata?: Record<string, unknown>;
  error_message?: string;
};

export async function POST(request: NextRequest) {
  // Authenticate via shared secret header
  const secret = request.headers.get("x-webhook-secret");
  if (
    process.env.ENGINE_WEBHOOK_SECRET &&
    secret !== process.env.ENGINE_WEBHOOK_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CallbackBody;
  try {
    body = (await request.json()) as CallbackBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ── Normalise field names from different engine versions ──────────────────
  const { job_id, status, metadata, error_message } = body;

  // Accept "content", "blocks", or "result" for structured block arrays
  const rawBlocks: EngineBlock[] | undefined =
    body.content ?? body.blocks ?? body.result;

  // Accept "markdown", "output", "text", or "output_markdown" for plain strings
  const markdownStr: string | undefined =
    body.markdown ?? body.output ?? body.text ?? body.output_markdown;

  console.log(`[webhook] job_id=${job_id} status=${status}`);
  console.log(`[webhook] received fields: ${Object.keys(body).join(", ")}`);
  console.log(`[webhook] blocks count: ${rawBlocks?.length ?? 0}, markdown length: ${markdownStr?.length ?? 0}`);

  if (!job_id || !status) {
    return NextResponse.json(
      { error: "Missing required fields: job_id, status" },
      { status: 400 }
    );
  }

  if (!["completed", "failed", "processing"].includes(status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const update: Record<string, unknown> = { status };

  if (status === "completed") {
    const blocks =
      rawBlocks && Array.isArray(rawBlocks) && rawBlocks.length > 0
        ? rawBlocks
        : null;

    if (blocks) {
      update.structured_content = blocks;
      const maxPage = blocks.reduce(
        (max, b) => Math.max(max, b.page ?? 1),
        1
      );
      update.page_count = maxPage;

      // Build the full markdown string from the block array
      const fullMarkdown = blocks
        .map((b) => b.markdown ?? b.text ?? "")
        .filter(Boolean)
        .join("\n\n");

      update.output_markdown =
        fullMarkdown.length > 0 ? fullMarkdown : "Content extraction error";

      console.log(
        "[webhook] markdown preview (first 100 chars):",
        (update.output_markdown as string).substring(0, 100)
      );
    } else if (markdownStr) {
      update.output_markdown = markdownStr;
    }

    if (metadata) {
      if (typeof metadata.page_count === "number") {
        update.page_count = metadata.page_count;
      }
    }
  }

  if (status === "failed") {
    update.error_message = error_message ?? "Engine reported an unknown error";
  }

  // Atomically charge the persistent quota before marking the job
  // completed. If consumption would exceed the monthly limit, flip the
  // job to failed instead so the user isn't charged and sees a clear
  // reason. Deletes never refund — the counter only moves forward.
  if (
    status === "completed" &&
    typeof update.page_count === "number" &&
    (update.page_count as number) > 0
  ) {
    const { data: jobRow } = await supabase
      .from("jobs")
      .select("account_id")
      .eq("id", job_id)
      .single();

    if (jobRow?.account_id) {
      const { data: consumeData } = await supabase.rpc("consume_pages", {
        p_account_id: jobRow.account_id,
        p_pages: update.page_count as number,
      });
      const consume = consumeData as { ok: boolean; error?: string } | null;
      if (!consume?.ok) {
        update.status = "failed";
        update.error_message =
          consume?.error === "limit_exceeded"
            ? "Monthly page limit reached."
            : "Quota check failed.";
        delete update.output_markdown;
        delete update.structured_content;
      }
    }
  }

  console.log(`[webhook] writing fields: ${Object.keys(update).join(", ")}`);

  const { error } = await supabase
    .from("jobs")
    .update(update)
    .eq("id", job_id);

  if (error) {
    console.error("[webhook] Supabase update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[webhook] job ${job_id} updated successfully, error=null`);
  return NextResponse.json({ success: true });
}
