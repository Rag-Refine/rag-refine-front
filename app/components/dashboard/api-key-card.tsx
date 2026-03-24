"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Key, Eye, EyeOff, Copy, Trash2, Plus, Terminal } from "lucide-react";
import { motion } from "motion/react";
import {
  generateApiKey,
  revokeApiKey,
} from "@/app/(dashboard)/dashboard/actions";

type ApiKey = {
  id: string;
  key_prefix: string;
  label: string;
  created_at: string;
};

export function ApiKeyCard({
  apiKeys,
  accountId,
  projectUrl,
}: {
  apiKeys: ApiKey[];
  accountId: string;
  projectUrl: string;
}) {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append("account_id", accountId);
      formData.append("label", "Default");
      const result = await generateApiKey({}, formData);
      if (result.key) {
        setNewKey(result.key);
        setRevealed(true);
        router.refresh();
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (keyId: string) => {
    const formData = new FormData();
    formData.append("key_id", keyId);
    await revokeApiKey({}, formData);
    setNewKey(null);
    router.refresh();
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayKey = apiKeys[0];
  const maskedKey = displayKey
    ? `${displayKey.key_prefix}${"•".repeat(24)}`
    : null;

  const curlExample = `curl -X POST ${projectUrl}/api/v1/convert \\
  -H "Authorization: Bearer ${newKey || "rr_your_api_key"}" \\
  -F "file=@document.pdf"`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-white/5 bg-surface-lowest/60 p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key size={18} className="text-primary" />
          <h3 className="text-sm font-semibold text-on-surface">API Key</h3>
        </div>
        {!displayKey && (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/25 disabled:opacity-50"
          >
            <Plus size={14} />
            {generating ? "Generating..." : "Generate Key"}
          </button>
        )}
      </div>

      {(displayKey || newKey) && (
        <div className="mt-4 space-y-4">
          {/* Key display */}
          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-surface-high px-4 py-3">
            <code className="flex-1 text-sm font-mono text-on-surface-variant">
              {revealed ? newKey || maskedKey : maskedKey}
            </code>
            <button
              onClick={() => setRevealed(!revealed)}
              className="rounded p-1 text-on-surface-variant hover:text-on-surface"
            >
              {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            <button
              onClick={() => handleCopy(newKey || maskedKey || "")}
              className="rounded p-1 text-on-surface-variant hover:text-on-surface"
            >
              {copied ? (
                <span className="text-xs text-secondary">Copied!</span>
              ) : (
                <Copy size={15} />
              )}
            </button>
            {displayKey && (
              <button
                onClick={() => handleRevoke(displayKey.id)}
                className="rounded p-1 text-on-surface-variant hover:text-error"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>

          {newKey && (
            <p className="text-xs text-error">
              Save this key now — you won&apos;t be able to see it again.
            </p>
          )}

          {/* Curl example */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant">
              <Terminal size={14} />
              Quick start
            </div>
            <div className="relative rounded-xl border border-white/5 bg-surface-high p-4">
              <pre className="overflow-x-auto text-xs leading-relaxed text-on-surface-variant">
                <code>{curlExample}</code>
              </pre>
              <button
                onClick={() => handleCopy(curlExample)}
                className="absolute right-3 top-3 rounded p-1 text-on-surface-variant hover:text-on-surface"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {!displayKey && !newKey && (
        <p className="mt-3 text-xs text-on-surface-variant">
          Generate an API key to integrate RAG-Refine into your pipeline.
        </p>
      )}
    </motion.div>
  );
}
