import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/utils/supabase/server";
import { AuditView } from "./audit-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("Metadata");
  const supabase = await createClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("file_name")
    .eq("id", id)
    .single();

  return {
    title: job
      ? t("jobTitle", { fileName: job.file_name })
      : t("jobTitleFallback"),
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (!job) notFound();

  let documentUrl: string | null = null;
  if (job.storage_path) {
    const { data } = await supabase.storage
      .from("user_uploads")
      .createSignedUrl(job.storage_path, 3600);
    documentUrl = data?.signedUrl ?? null;
  }

  return <AuditView job={job} documentUrl={documentUrl} />;
}
