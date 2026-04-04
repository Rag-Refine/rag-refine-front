import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";

type CallbackBody = {
  job_id?: string;
  status?: string;
  markdown?: string;
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

  const { job_id, status, markdown, error_message } = body;

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
    update.output_markdown = markdown ?? null;
  }
  if (status === "failed") {
    update.error_message = error_message ?? "Engine reported an unknown error";
  }

  const { data, error } = await supabase
    .from("jobs")
    .update(update)
    .eq("id", job_id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
