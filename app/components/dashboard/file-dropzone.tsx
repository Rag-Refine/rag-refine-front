"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { sha256 } from "@/utils/hash";
import { checkFileHash, uploadFile } from "../../(dashboard)/dashboard/actions";
import { createClient } from "@/utils/supabase/client";

type UploadStatus =
  | "uploading"
  | "verifying"
  | "processing"
  | "refining"
  | "completed"
  | "failed";

type UploadItem = {
  id: string;
  file: File;
  status: UploadStatus;
  error?: string;
  duplicate?: boolean;
};

const ACTIVE_STATUSES: UploadStatus[] = [
  "uploading",
  "verifying",
  "processing",
  "refining",
];

export function FileDropzone({ accountId }: { accountId: string }) {
  const t = useTranslations("Dropzone");
  const tJobs = useTranslations("Jobs");
  const tErrors = useTranslations("Errors");
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  const supabase = useMemo(() => createClient(), []);

  // Per-upload Realtime channel handles
  const channelsRef = useRef<
    Map<string, ReturnType<typeof supabase.channel>>
  >(new Map());

  // Clean up all channels on unmount
  useEffect(() => {
    return () => {
      channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [supabase]);

  const updateUpload = useCallback(
    (id: string, patch: Partial<UploadItem>) =>
      setUploads((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...patch } : u))
      ),
    []
  );

  const subscribeToJob = useCallback(
    (uploadId: string, jobId: string) => {
      const channel = supabase
        .channel(`job-${jobId}-${uploadId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "jobs",
            filter: `id=eq.${jobId}`,
          },
          (payload) => {
            const jobStatus = (payload.new as { status: string }).status;
            if (jobStatus === "completed") {
              updateUpload(uploadId, { status: "completed" });
              toast.success(tJobs("success.converted"));
              supabase.removeChannel(channel);
              channelsRef.current.delete(uploadId);
            } else if (jobStatus === "failed") {
              const errMsg = (
                payload.new as { error_message?: string | null }
              ).error_message;
              updateUpload(uploadId, {
                status: "failed",
                error: errMsg ?? tJobs("error.generic"),
              });
              toast.error(errMsg ?? tJobs("error.generic"));
              supabase.removeChannel(channel);
              channelsRef.current.delete(uploadId);
            }
          }
        )
        .subscribe();

      channelsRef.current.set(uploadId, channel);
    },
    [supabase, updateUpload, tJobs]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newUploads: UploadItem[] = acceptedFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: "uploading" as const,
      }));

      setUploads((prev) => [...newUploads, ...prev]);

      for (const upload of newUploads) {
        try {
          // 1. Compute SHA-256 hash in the browser
          const buffer = await upload.file.arrayBuffer();
          const fileHash = await sha256(buffer);

          // 2. Check for a completed duplicate on the server
          updateUpload(upload.id, { status: "verifying" });
          const hashResult = await checkFileHash(fileHash);

          if (hashResult.error) {
            updateUpload(upload.id, {
              status: "failed",
              error: hashResult.error,
            });
            toast.error(tJobs("error.generic"));
            continue;
          }

          if (hashResult.duplicate) {
            updateUpload(upload.id, { status: "completed", duplicate: true });
            toast.info(tJobs("upload.duplicate_found"));
            continue;
          }

          // 3. No duplicate — upload and hand off to the engine
          updateUpload(upload.id, { status: "processing" });

          const formData = new FormData();
          formData.append("file", upload.file);

          const result = await uploadFile({}, formData);

          if (result.error) {
            updateUpload(upload.id, { status: "failed", error: result.error });
            toast.error(result.error);
          } else if (result.jobId) {
            // Engine accepted the job — subscribe to Realtime for completion
            updateUpload(upload.id, { status: "refining" });
            subscribeToJob(upload.id, result.jobId);
          }
        } catch {
          updateUpload(upload.id, {
            status: "failed",
            error: tErrors("uploadFailed"),
          });
          toast.error(tJobs("error.generic"));
        }
      }
    },
    [updateUpload, subscribeToJob, tJobs, tErrors]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 50 * 1024 * 1024,
  });

  const removeUpload = (id: string) => {
    const channel = channelsRef.current.get(id);
    if (channel) {
      supabase.removeChannel(channel);
      channelsRef.current.delete(id);
    }
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  const statusLabel = (upload: UploadItem): string => {
    switch (upload.status) {
      case "verifying":
        return tJobs("upload.verifying");
      case "processing":
        return tJobs("status.processing");
      case "refining":
        return tJobs("status.refining");
      case "completed":
        return tJobs("status.completed");
      default:
        return `${(upload.file.size / 1024).toFixed(0)} KB`;
    }
  };

  // suppress unused variable warning — accountId is reserved for future use
  void accountId;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200 ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-white/10 bg-surface-lowest/60 hover:border-primary/30 hover:bg-surface-lowest/80"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3 px-6 py-12">
          <motion.div
            animate={isDragActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`rounded-2xl p-4 ${
              isDragActive ? "bg-primary/15" : "bg-surface-high"
            }`}
          >
            <Upload
              size={28}
              className={
                isDragActive ? "text-primary" : "text-on-surface-variant"
              }
            />
          </motion.div>
          <div className="text-center">
            <p className="text-sm font-medium text-on-surface">
              {isDragActive ? t("dropHere") : t("dragAndDrop")}
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              {t("supportedFormats")}
            </p>
          </div>
        </div>
      </div>

      {/* Upload progress list */}
      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {uploads.map((upload) => (
              <motion.div
                key={upload.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-surface-low px-4 py-3"
              >
                <FileText size={18} className="text-on-surface-variant" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm text-on-surface">
                    {upload.file.name}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {statusLabel(upload)}
                  </p>
                </div>

                {ACTIVE_STATUSES.includes(upload.status) && (
                  <Loader2 size={16} className="animate-spin text-primary" />
                )}

                {upload.status === "completed" && (
                  <CheckCircle2
                    size={16}
                    className={
                      upload.duplicate ? "text-primary" : "text-secondary"
                    }
                  />
                )}

                {upload.status === "failed" && (
                  <span className="max-w-[160px] truncate text-xs text-error">
                    {upload.error || t("failed")}
                  </span>
                )}

                <button
                  onClick={() => removeUpload(upload.id)}
                  className="rounded p-1 text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
