"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  X,
} from "lucide-react";
import { generateApiKey, revokeApiKey } from "@/app/(dashboard)/dashboard/actions";
import { Modal } from "@/app/components/ui/modal";

// ── Types ─────────────────────────────────────────────────────────────────────

type ApiKey = {
  id: string;
  name: string;
  key_display: string;
  last_used_at: string | null;
  created_at: string;
};

type Toast = {
  id: number;
  message: string;
  type: "success" | "error";
};

// ── Toast ─────────────────────────────────────────────────────────────────────

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-sm ${
              toast.type === "success"
                ? "border-secondary/20 bg-surface-low text-on-surface"
                : "border-error/20 bg-surface-low text-on-surface"
            }`}
          >
            {toast.type === "success" ? (
              <Check size={15} className="text-secondary shrink-0" />
            ) : (
              <AlertTriangle size={15} className="text-error shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              className="ml-1 rounded p-0.5 text-on-surface-variant hover:text-on-surface"
            >
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Main component ────────────────────────────────────────────────────────────

export function ApiKeysManager({
  apiKeys,
  accountId,
}: {
  apiKeys: ApiKey[];
  accountId: string;
}) {
  const t = useTranslations("ApiKeys");
  const router = useRouter();

  // ── Toast state ──────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextIdRef = useRef(0);

  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = ++nextIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Create-key modal state ───────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [phase, setPhase] = useState<"form" | "reveal">("form");
  const [keyName, setKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const openModal = () => {
    setPhase("form");
    setKeyName("");
    setNewRawKey(null);
    setCopied(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    if (phase === "reveal") router.refresh();
  };

  const handleCreate = async () => {
    if (!keyName.trim()) return;
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append("account_id", accountId);
      formData.append("name", keyName.trim());
      const result = await generateApiKey({}, formData);
      if (result.error) {
        addToast(result.error, "error");
        setModalOpen(false);
      } else if (result.key) {
        setNewRawKey(result.key);
        setPhase("reveal");
        addToast(t("toastCreated"), "success");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!newRawKey) return;
    await navigator.clipboard.writeText(newRawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Revoke state ─────────────────────────────────────────────────────────
  const [revoking, setRevoking] = useState<string | null>(null);

  const handleRevoke = async (keyId: string) => {
    setRevoking(keyId);
    try {
      const formData = new FormData();
      formData.append("key_id", keyId);
      const result = await revokeApiKey({}, formData);
      if (result.error) {
        addToast(result.error, "error");
      } else {
        addToast(t("toastRevoked"), "success");
        router.refresh();
      }
    } finally {
      setRevoking(null);
    }
  };

  return (
    <>
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-4"
        >
          <div>
            <h1 className="text-xl font-semibold text-on-surface">
              {t("pageTitle")}
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              {t("pageDescription")}
            </p>
          </div>
          <button
            onClick={openModal}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-primary/15 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/25"
          >
            <Plus size={16} />
            {t("createKey")}
          </button>
        </motion.div>

        {/* ── Key table ──────────────────────────────────────────────────── */}
        {apiKeys.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="overflow-hidden rounded-2xl border border-white/5 bg-surface-lowest/60"
          >
            {/* Desktop table */}
            <table className="hidden w-full text-sm md:table">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs text-on-surface-variant">
                  <th className="px-5 py-3 font-medium">{t("tableNameHeader")}</th>
                  <th className="px-5 py-3 font-medium">{t("tableKeyHeader")}</th>
                  <th className="px-5 py-3 font-medium">{t("tableCreatedHeader")}</th>
                  <th className="px-5 py-3 font-medium">{t("tableLastUsedHeader")}</th>
                  <th className="px-5 py-3 font-medium">{t("tableActionsHeader")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {apiKeys.map((key, i) => (
                  <motion.tr
                    key={key.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="group transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4 font-medium text-on-surface">
                      {key.name}
                    </td>
                    <td className="px-5 py-4">
                      <code className="font-mono text-xs text-on-surface-variant">
                        {key.key_display}
                      </code>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant">
                      {formatDate(key.created_at)}
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant">
                      {key.last_used_at ? formatDate(key.last_used_at) : t("neverUsed")}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleRevoke(key.id)}
                        disabled={revoking === key.id}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-on-surface-variant transition hover:bg-error/10 hover:text-error disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                        {revoking === key.id ? t("revoking") : t("revokeKey")}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="divide-y divide-white/5 md:hidden">
              {apiKeys.map((key, i) => (
                <motion.div
                  key={key.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="space-y-3 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Key size={14} className="text-primary shrink-0" />
                      <span className="font-medium text-on-surface text-sm">
                        {key.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRevoke(key.id)}
                      disabled={revoking === key.id}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-on-surface-variant transition hover:bg-error/10 hover:text-error disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                      {revoking === key.id ? t("revoking") : t("revokeKey")}
                    </button>
                  </div>
                  <code className="block font-mono text-xs text-on-surface-variant">
                    {key.key_display}
                  </code>
                  <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                    <span>
                      {t("tableCreatedHeader")}: {formatDate(key.created_at)}
                    </span>
                    <span>
                      {t("tableLastUsedHeader")}:{" "}
                      {key.last_used_at ? formatDate(key.last_used_at) : t("neverUsed")}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ── Empty state ──────────────────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-surface-lowest/40 py-20 text-center"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Key size={24} className="text-primary" />
            </div>
            <h3 className="text-base font-semibold text-on-surface">
              {t("emptyTitle")}
            </h3>
            <p className="mt-1.5 max-w-xs text-sm text-on-surface-variant">
              {t("emptyDescription")}
            </p>
            <button
              onClick={openModal}
              className="mt-6 flex items-center gap-2 rounded-xl bg-primary/15 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/25"
            >
              <Plus size={16} />
              {t("emptyAction")}
            </button>
          </motion.div>
        )}
      </div>

      {/* ── Create / Reveal Modal ─────────────────────────────────────────── */}
      <Modal open={modalOpen} onClose={closeModal}>
        <div className="p-6 sm:p-8">
          {phase === "form" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-on-surface">
                  {t("modalCreateTitle")}
                </h2>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="key-name"
                  className="block text-sm font-medium text-on-surface-variant"
                >
                  {t("modalKeyNameLabel")}
                </label>
                <input
                  id="key-name"
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder={t("modalKeyNamePlaceholder")}
                  autoFocus
                  className="w-full rounded-xl border border-white/10 bg-surface-high px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="rounded-xl px-4 py-2 text-sm text-on-surface-variant transition hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!keyName.trim() || creating}
                  className="flex items-center gap-2 rounded-xl bg-primary/15 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/25 disabled:opacity-50"
                >
                  {creating ? t("modalCreating") : t("modalCreateButton")}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-on-surface">
                  {t("modalRevealTitle")}
                </h2>
              </div>

              {/* Warning banner */}
              <div className="flex items-start gap-3 rounded-xl border border-error/20 bg-error/5 px-4 py-3">
                <AlertTriangle
                  size={16}
                  className="mt-0.5 text-error shrink-0"
                />
                <p className="text-sm text-on-surface-variant">
                  {t("modalRevealWarning")}
                </p>
              </div>

              {/* Key display */}
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-high px-4 py-3">
                <code className="flex-1 break-all font-mono text-sm text-on-surface">
                  {newRawKey}
                </code>
                <button
                  onClick={handleCopy}
                  className="ml-2 flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-on-surface-variant transition hover:bg-white/5 hover:text-on-surface"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-secondary" />
                      {t("modalCopied")}
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      {t("modalCopyKey")}
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="rounded-xl bg-primary/15 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/25"
                >
                  {t("modalDone")}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Toast stack ──────────────────────────────────────────────────── */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
