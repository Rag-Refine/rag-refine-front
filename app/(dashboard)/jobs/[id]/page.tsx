import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/utils/supabase/server";
import { ArrowLeft, FileText, FileCode } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { CopyMarkdownButton } from "./copy-button";

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
  const t = await getTranslations("JobDetail");
  const tStatus = await getTranslations("Status");
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (!job) notFound();

  // Generate a signed URL for the original document
  let documentUrl: string | null = null;
  if (job.storage_path) {
    const { data } = await supabase.storage
      .from("documents")
      .createSignedUrl(job.storage_path, 3600);
    documentUrl = data?.signedUrl ?? null;
  }

  return (
    <div className="flex h-full flex-col">
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
          <h1 className="text-lg font-semibold text-on-surface">
            {job.file_name}
          </h1>
          <Badge
            variant={
              job.status as "processing" | "completed" | "failed" | "pending"
            }
          >
            {tStatus(job.status as "pending" | "processing" | "completed" | "failed")}
          </Badge>
        </div>
        {job.output_markdown && (
          <div className="ml-auto">
            <CopyMarkdownButton markdown={job.output_markdown} />
          </div>
        )}
      </div>

      {/* Side-by-side panels */}
      <div className="mt-4 grid flex-1 gap-4 lg:grid-cols-2">
        {/* Left: Original document */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-surface-lowest/60">
          <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
            <FileText size={16} className="text-on-surface-variant" />
            <span className="text-sm font-medium text-on-surface-variant">
              {t("originalDocument")}
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            {documentUrl ? (
              <iframe
                src={documentUrl}
                className="h-full min-h-[500px] w-full"
                title={t("originalDocument")}
              />
            ) : (
              <div className="flex h-full items-center justify-center p-8">
                <p className="text-sm text-on-surface-variant">
                  {t("documentNotAvailable")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Markdown output */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-surface-lowest/60">
          <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
            <FileCode size={16} className="text-on-surface-variant" />
            <span className="text-sm font-medium text-on-surface-variant">
              {t("markdownOutput")}
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {job.output_markdown ? (
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-on-surface-variant">
                {job.output_markdown}
              </pre>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-on-surface-variant">
                  {job.status === "processing"
                    ? t("processing")
                    : job.status === "failed"
                      ? job.error_message || t("conversionFailed")
                      : t("noOutput")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
