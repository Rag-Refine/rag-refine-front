"use client";

import { useActionState, useEffect, useState, useCallback, useRef } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import {
  MessageCircle,
  BookOpen,
  Mail,
  ChevronDown,
  Check,
  AlertTriangle,
  X,
  Loader2,
  Send,
} from "lucide-react";
import { submitTicket, type TicketState } from "./actions";

// ── Types ──────────────────────────────────────────────────────────────────────

type Toast = {
  id: number;
  message: string;
  type: "success" | "error";
};

// ── Toast ──────────────────────────────────────────────────────────────────────

function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
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

// ── Submit button (needs useFormStatus inside form) ────────────────────────────

function SubmitButton({ label, submittingLabel }: { label: string; submittingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <motion.button
      type="submit"
      disabled={pending}
      whileHover={{ scale: pending ? 1 : 1.02 }}
      whileTap={{ scale: pending ? 1 : 0.98 }}
      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          {submittingLabel}
        </>
      ) : (
        <>
          <Send size={15} />
          {label}
        </>
      )}
    </motion.button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

const initialState: TicketState = {};

export function SupportPageClient() {
  const t = useTranslations("Support");
  const [state, action] = useActionState(submitTicket, initialState);

  // ── Toast state ────────────────────────────────────────────────────────────
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

  // ── Form reset key ─────────────────────────────────────────────────────────
  const [formKey, setFormKey] = useState(0);

  // ── React to server action result ──────────────────────────────────────────
  useEffect(() => {
    if (state.success) {
      addToast(t("form.successToast"), "success");
      setFormKey((k) => k + 1);
    } else if (state.error) {
      addToast(state.error, "error");
    }
  }, [state, addToast, t]);

  // ── FAQ accordion ──────────────────────────────────────────────────────────
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
  ];

  const subjects = [
    { value: "bug", label: t("form.subjects.bug") },
    { value: "feature", label: t("form.subjects.feature") },
    { value: "billing", label: t("form.subjects.billing") },
    { value: "other", label: t("form.subjects.other") },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">{t("title")}</h1>
        <p className="mt-1 text-sm text-on-surface-variant">{t("subtitle")}</p>
      </div>

      {/* Top row: 2-col grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Contact Form ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/8 bg-surface-high p-6 flex flex-col gap-5">
          <h2 className="text-base font-semibold text-on-surface">{t("form.title")}</h2>

          <form key={formKey} action={action} className="flex flex-col gap-4">
            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                {t("form.subject")}
              </label>
              <select
                name="subject"
                defaultValue=""
                className="w-full rounded-xl border border-white/10 bg-surface-low px-3 py-2.5 text-sm text-on-surface focus:border-primary/50 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="" disabled className="text-on-surface-variant">
                  {t("form.subjectPlaceholder")}
                </option>
                {subjects.map((s) => (
                  <option key={s.value} value={s.value} className="bg-surface-low">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                {t("form.message")}
              </label>
              <textarea
                name="message"
                rows={6}
                minLength={20}
                placeholder={t("form.messagePlaceholder")}
                className="w-full resize-none rounded-xl border border-white/10 bg-surface-low px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/50 focus:outline-none transition-colors"
              />
              <p className="text-xs text-on-surface-variant">{t("form.messageMinLength")}</p>
            </div>

            <div className="flex justify-end">
              <SubmitButton label={t("form.submit")} submittingLabel={t("form.submitting")} />
            </div>
          </form>
        </div>

        {/* ── Quick Links ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/8 bg-surface-high p-6 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-on-surface">{t("links.title")}</h2>

          <div className="flex flex-col gap-3">
            {/* WhatsApp */}
            <a
              href="https://chat.whatsapp.com/placeholder"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-xl border border-white/8 bg-surface-low p-4 transition-colors hover:border-primary/30 hover:bg-white/5 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/10">
                <MessageCircle size={20} className="text-[#25D366]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
                  {t("links.whatsapp")}
                </p>
                <p className="text-xs text-on-surface-variant">{t("links.whatsappDesc")}</p>
              </div>
            </a>

            {/* Documentation */}
            <Link
              href="/docs"
              className="flex items-center gap-4 rounded-xl border border-white/8 bg-surface-low p-4 transition-colors hover:border-primary/30 hover:bg-white/5 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen size={20} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
                  {t("links.docs")}
                </p>
                <p className="text-xs text-on-surface-variant">{t("links.docsDesc")}</p>
              </div>
            </Link>

            {/* Email */}
            <a
              href="mailto:support@rag-refine.com"
              className="flex items-center gap-4 rounded-xl border border-white/8 bg-surface-low p-4 transition-colors hover:border-primary/30 hover:bg-white/5 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
                <Mail size={20} className="text-secondary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
                  {t("links.email")}
                </p>
                <p className="text-xs text-on-surface-variant">{t("links.emailDesc")}</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* ── FAQ Accordion ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/8 bg-surface-high p-6 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-on-surface">{t("faq.title")}</h2>

        <div className="flex flex-col divide-y divide-white/8">
          {faqs.map((item, i) => (
            <div key={i}>
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-on-surface hover:text-primary transition-colors"
              >
                <span>{item.q}</span>
                <motion.div
                  animate={{ rotate: openFaq === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown size={16} className="text-on-surface-variant" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {openFaq === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="pb-4 text-sm text-on-surface-variant leading-relaxed">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
