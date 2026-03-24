"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { uploadFile } from "../../(dashboard)/dashboard/actions";

type UploadItem = {
  id: string;
  file: File;
  status: "uploading" | "completed" | "failed";
  error?: string;
};

export function FileDropzone({ accountId }: { accountId: string }) {
  const t = useTranslations("Dropzone");
  const tErrors = useTranslations("Errors");
  const [uploads, setUploads] = useState<UploadItem[]>([]);

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
          const formData = new FormData();
          formData.append("file", upload.file);
          formData.append("account_id", accountId);

          const result = await uploadFile({}, formData);

          setUploads((prev) =>
            prev.map((u) =>
              u.id === upload.id
                ? {
                    ...u,
                    status: result.error ? "failed" : "completed",
                    error: result.error,
                  }
                : u
            )
          );
        } catch {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === upload.id
                ? { ...u, status: "failed", error: tErrors("uploadFailed") }
                : u
            )
          );
        }
      }
    },
    [accountId, tErrors]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/html": [".html"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

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
                    {(upload.file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                {upload.status === "uploading" && (
                  <Loader2
                    size={16}
                    className="animate-spin text-primary"
                  />
                )}
                {upload.status === "completed" && (
                  <CheckCircle2 size={16} className="text-secondary" />
                )}
                {upload.status === "failed" && (
                  <span className="text-xs text-error">
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
