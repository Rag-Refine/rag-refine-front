"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/utils/supabase/server";
import { sha256 } from "@/utils/hash";

// ── Shared helper: resolve account_id for the current user ───────────────────

async function resolveAccountId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("account_members")
    .select("account_id")
    .eq("user_id", user.id)
    .single();

  return membership?.account_id ?? null;
}

// ── Check File Hash (duplicate detection) ────────────────────────────────────

export type CheckHashState = {
  error?: string;
  jobId?: string;
  duplicate?: boolean;
};

export async function checkFileHash(fileHash: string): Promise<CheckHashState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const accountId = await resolveAccountId();
  if (!accountId) return { error: "Account not found" };

  const { data: existing } = await supabase
    .from("jobs")
    .select("id")
    .eq("account_id", accountId)
    .eq("file_hash", fileHash)
    .eq("status", "completed")
    .maybeSingle();

  if (existing) {
    return { jobId: existing.id, duplicate: true };
  }

  return {};
}

// ── Upload File ──────────────────────────────────────────────────────────────

export type UploadState = {
  error?: string;
  jobId?: string;
  duplicate?: boolean;
};

export async function uploadFile(
  _prevState: UploadState | Record<string, never>,
  formData: FormData,
): Promise<UploadState> {
  const t = await getTranslations("Errors");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: t("notAuthenticated") };

  // Resolve account server-side — never trust the client
  const accountId = await resolveAccountId();
  if (!accountId) return { error: t("accountRequired") };

  const file = formData.get("file") as File | null;
  if (!file) return { error: t("fileAndAccountRequired") };

  if (file.type !== "application/pdf") {
    return { error: t("unsupportedFileType") };
  }

  if (file.size > 50 * 1024 * 1024) {
    return { error: t("fileSizeExceeds") };
  }

  const arrayBuffer = await file.arrayBuffer();
  const fileHash = await sha256(arrayBuffer);

  // Create job with pending status
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({
      account_id: accountId,
      user_id: user.id,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      status: "pending",
      file_hash: fileHash,
    })
    .select("id")
    .single();

  if (jobError) {
    return { error: jobError.message };
  }

  // Upload file to user_uploads bucket: {account_id}/{job_id}.pdf
  const storagePath = `${accountId}/${job.id}.pdf`;
  const { error: storageError } = await supabase.storage
    .from("user_uploads")
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  await supabase
    .from("jobs")
    .update({ storage_path: storageError ? null : storagePath })
    .eq("id", job.id);

  // ── Forward to Python engine (async) ──────────────────────────────────────
  const tJobs = await getTranslations("Jobs");
  const engineUrl = process.env.PDF_ENGINE_URL ?? "http://localhost:8888";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://host.docker.internal:3000";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  try {
    const engineForm = new FormData();
    engineForm.append(
      "file",
      new Blob([arrayBuffer], { type: file.type }),
      file.name,
    );
    engineForm.append("job_id", job.id);
    engineForm.append("callback_url", `${appUrl}/api/webhooks/engine-callback`);

    const engineRes = await fetch(`${engineUrl}/convert`, {
      method: "POST",
      body: engineForm,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!engineRes.ok) {
      throw new Error(
        `Engine error: ${engineRes.status} ${engineRes.statusText}`,
      );
    }

    // Engine accepted the job and will call our webhook when done
    await supabase
      .from("jobs")
      .update({ status: "processing" })
      .eq("id", job.id);

    revalidatePath("/dashboard");
    return { jobId: job.id };
  } catch (err) {
    clearTimeout(timeoutId);

    const isOffline =
      (err instanceof Error && err.name === "AbortError") ||
      (err as NodeJS.ErrnoException).code === "ECONNREFUSED";

    const errorMessage = isOffline
      ? tJobs("error.engine_offline")
      : err instanceof Error
        ? err.message
        : String(err);

    await supabase
      .from("jobs")
      .update({ status: "failed", error_message: errorMessage })
      .eq("id", job.id);

    revalidatePath("/dashboard");
    return { error: errorMessage, jobId: job.id };
  }
}

// ── Delete Job ───────────────────────────────────────────────────────────────

export type DeleteState = {
  error?: string;
};

export async function deleteJob(
  _prevState: DeleteState | Record<string, never>,
  formData: FormData,
): Promise<DeleteState> {
  const t = await getTranslations("Errors");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: t("notAuthenticated") };

  const jobId = formData.get("job_id") as string;
  if (!jobId) return { error: t("jobIdRequired") };

  const { data: job } = await supabase
    .from("jobs")
    .select("storage_path")
    .eq("id", jobId)
    .single();

  if (job?.storage_path) {
    await supabase.storage.from("user_uploads").remove([job.storage_path]);
  }

  const { error } = await supabase.from("jobs").delete().eq("id", jobId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return {};
}

// ── Generate API Key ─────────────────────────────────────────────────────────

export type ApiKeyState = {
  error?: string;
  key?: string;
};

export async function generateApiKey(
  _prevState: ApiKeyState | Record<string, never>,
  formData: FormData,
): Promise<ApiKeyState> {
  const t = await getTranslations("Errors");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: t("notAuthenticated") };

  const accountId = formData.get("account_id") as string;
  const name = (formData.get("name") as string) || "Default";

  if (!accountId) return { error: t("accountRequired") };

  // Generate a cryptographically random key with rr_live_ prefix
  const rawBytes = crypto.getRandomValues(new Uint8Array(32));
  const rawHex = Array.from(rawBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const fullKey = `rr_live_${rawHex}`;
  // Display: first 16 chars + "..." + last 4 chars  →  rr_live_a1b2c3d4...3f8e
  const keyDisplay = `${fullKey.slice(0, 16)}...${fullKey.slice(-4)}`;

  // Hash the key for storage — never store the raw value
  const encoder = new TextEncoder();
  const data = encoder.encode(fullKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const keyHash = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const { error } = await supabase.from("api_keys").insert({
    account_id: accountId,
    user_id: user.id,
    name,
    key_display: keyDisplay,
    key_hash: keyHash,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/api-keys");
  return { key: fullKey };
}

// ── Revoke API Key ───────────────────────────────────────────────────────────

export type RevokeState = {
  error?: string;
};

export async function revokeApiKey(
  _prevState: RevokeState | Record<string, never>,
  formData: FormData,
): Promise<RevokeState> {
  const t = await getTranslations("Errors");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: t("notAuthenticated") };

  const keyId = formData.get("key_id") as string;
  if (!keyId) return { error: t("keyIdRequired") };

  const { error } = await supabase.from("api_keys").delete().eq("id", keyId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/api-keys");
  return {};
}
