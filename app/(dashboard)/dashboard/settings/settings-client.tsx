"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { User, SlidersHorizontal, ShieldAlert, CheckCircle, AlertCircle, Sun, Moon } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Modal } from "@/app/components/ui/modal";
import { updateProfile, updatePreferences, deleteAccount } from "./actions";
import type { SettingsActionState } from "./actions";

// ── Language options ──────────────────────────────────────────────────────────

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ar", label: "Arabic" },
];

// ── Tab types ─────────────────────────────────────────────────────────────────

type Tab = "profile" | "preferences" | "account";

// ── Shared sub-components ─────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface-low p-6">
      {children}
    </div>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-on-surface">
      {children}
    </label>
  );
}

function TextInput({
  id,
  name,
  defaultValue,
  placeholder,
  disabled,
  readOnly,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  return (
    <input
      id={id}
      name={name}
      type="text"
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      className={`w-full rounded-xl border border-white/8 bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/30 ${
        readOnly || disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
    />
  );
}

function StatusBanner({ state }: { state: SettingsActionState | Record<string, never> }) {
  if (!("error" in state) && !("success" in state)) return null;

  const isError = "error" in state && !!state.error;
  return (
    <AnimatePresence>
      <motion.div
        key={isError ? "error" : "success"}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
          isError
            ? "bg-error/10 text-error"
            : "bg-secondary/10 text-secondary"
        }`}
      >
        {isError ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
        {isError ? state.error : (state as SettingsActionState).success}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Avatar placeholder ────────────────────────────────────────────────────────

function AvatarPlaceholder({ name, email }: { name: string; email: string }) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : email[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary ring-2 ring-primary/30">
      {initials}
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────

function ProfileTab({
  userEmail,
  initialFullName,
}: {
  userEmail: string;
  initialFullName: string;
}) {
  const t = useTranslations("Settings");
  const [state, formAction, pending] = useActionState<
    SettingsActionState | Record<string, never>,
    FormData
  >(updateProfile, {});

  // Derive current name from form submission (optimistic display)
  const [displayName, setDisplayName] = useState(initialFullName);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if ("success" in state && state.success) {
      const nameInput = formRef.current?.querySelector<HTMLInputElement>(
        'input[name="full_name"]'
      );
      if (nameInput) setDisplayName(nameInput.value);
    }
  }, [state]);

  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <h2 className="mb-1 text-base font-semibold text-on-surface">
          {t("profile.title")}
        </h2>
        <p className="mb-6 text-sm text-on-surface-variant">
          {t("profile.description")}
        </p>

        {/* Avatar */}
        <div className="mb-6 flex items-center gap-4">
          <AvatarPlaceholder name={displayName} email={userEmail} />
          <div>
            <p className="text-sm font-medium text-on-surface">
              {t("profile.avatarLabel")}
            </p>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              Avatar upload coming soon.
            </p>
          </div>
        </div>

        <StatusBanner state={state} />

        <form ref={formRef} action={formAction} className="mt-4 flex flex-col gap-4">
          {/* Full Name */}
          <div>
            <FieldLabel htmlFor="full_name">{t("profile.nameLabel")}</FieldLabel>
            <TextInput
              id="full_name"
              name="full_name"
              defaultValue={initialFullName}
              placeholder={t("profile.namePlaceholder")}
              disabled={pending}
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <FieldLabel htmlFor="email">{t("profile.emailLabel")}</FieldLabel>
            <TextInput
              id="email"
              name="email"
              defaultValue={userEmail}
              readOnly
            />
            <p className="mt-1.5 text-xs text-on-surface-variant">
              {t("profile.emailReadOnly")}
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={pending}
              className="min-w-[130px]"
            >
              {pending ? t("profile.saving") : t("profile.saveButton")}
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}

// ── Preferences Tab ───────────────────────────────────────────────────────────

function PreferencesTab({ initialLanguage }: { initialLanguage: string }) {
  const t = useTranslations("Settings");
  const [state, formAction, pending] = useActionState<
    SettingsActionState | Record<string, never>,
    FormData
  >(updatePreferences, {});

  // Theme: localStorage-based MVP toggle
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark =
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <h2 className="mb-1 text-base font-semibold text-on-surface">
          {t("preferences.title")}
        </h2>
        <p className="mb-6 text-sm text-on-surface-variant">
          {t("preferences.description")}
        </p>

        <StatusBanner state={state} />

        <form action={formAction} className="mt-4 flex flex-col gap-6">
          {/* Language */}
          <div>
            <FieldLabel htmlFor="preferred_language">
              {t("preferences.languageLabel")}
            </FieldLabel>
            <select
              id="preferred_language"
              name="preferred_language"
              defaultValue={initialLanguage}
              disabled={pending}
              className="w-full rounded-xl border border-white/8 bg-surface-container px-4 py-2.5 text-sm text-on-surface outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={pending}
              className="min-w-[160px]"
            >
              {pending
                ? t("preferences.saving")
                : t("preferences.saveButton")}
            </Button>
          </div>
        </form>
      </SectionCard>

      {/* Theme — client-only, no server action needed */}
      <SectionCard>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-on-surface">
              {t("preferences.themeLabel")}
            </p>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              {t("preferences.themeDescription")}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              isDark ? t("preferences.themeLight") : t("preferences.themeDark")
            }
            className={`relative flex h-8 w-14 items-center rounded-full border transition-colors ${
              isDark
                ? "border-primary/40 bg-primary/20"
                : "border-white/10 bg-surface-high"
            }`}
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
              className={`absolute flex h-6 w-6 items-center justify-center rounded-full shadow ${
                isDark
                  ? "left-[calc(100%-28px)] bg-primary text-on-primary"
                  : "left-1 bg-surface-highest text-on-surface-variant"
              }`}
            >
              {isDark ? <Moon size={12} /> : <Sun size={12} />}
            </motion.span>
          </button>
        </div>
        <p className="mt-3 text-xs text-on-surface-variant">
          {isDark ? t("preferences.themeDark") : t("preferences.themeLight")}
        </p>
      </SectionCard>
    </div>
  );
}

// ── Account Tab ───────────────────────────────────────────────────────────────

function AccountTab() {
  const t = useTranslations("Settings");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [state, formAction, pending] = useActionState<
    SettingsActionState | Record<string, never>,
    FormData
  >(deleteAccount, {});

  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <h2 className="mb-1 text-base font-semibold text-on-surface">
          {t("account.title")}
        </h2>
        <p className="mb-6 text-sm text-on-surface-variant">
          {t("account.description")}
        </p>

        {/* Danger Zone */}
        <div className="rounded-xl border border-error/25 bg-error/5 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-error">
            <ShieldAlert size={16} />
            {t("account.dangerZoneTitle")}
          </div>
          <p className="mt-2 text-sm text-on-surface-variant">
            {t("account.dangerZoneDescription")}
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="rounded-xl border border-error/30 bg-error/10 px-4 py-2 text-sm font-semibold text-error transition hover:bg-error/20 active:scale-95"
            >
              {t("account.deleteButton")}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error/15 text-error">
              <ShieldAlert size={20} />
            </div>
            <h3 className="text-base font-semibold text-on-surface">
              {t("account.deleteDialogTitle")}
            </h3>
          </div>

          <p className="text-sm text-on-surface-variant">
            {t("account.deleteDialogDescription")}
          </p>

          {"error" in state && state.error && (
            <div className="flex items-center gap-2 rounded-xl bg-error/10 px-4 py-3 text-sm font-medium text-error">
              <AlertCircle size={15} />
              {state.error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={pending}
            >
              {t("account.deleteDialogCancel")}
            </Button>

            <form action={formAction}>
              <button
                type="submit"
                disabled={pending}
                className="rounded-xl bg-error px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending
                  ? t("account.deleting")
                  : t("account.deleteDialogConfirm")}
              </button>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Settings Client (root) ────────────────────────────────────────────────────

export function SettingsClient({
  userEmail,
  initialFullName,
  initialLanguage,
}: {
  userEmail: string;
  initialFullName: string;
  initialLanguage: string;
}) {
  const t = useTranslations("Settings");
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: t("tabs.profile"), icon: User },
    { id: "preferences", label: t("tabs.preferences"), icon: SlidersHorizontal },
    { id: "account", label: t("tabs.account"), icon: ShieldAlert },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-on-surface">{t("pageTitle")}</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          {t("pageDescription")}
        </p>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 border-b border-white/5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 pb-3 pt-1 text-sm font-medium transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "profile" && (
            <ProfileTab
              userEmail={userEmail}
              initialFullName={initialFullName}
            />
          )}
          {activeTab === "preferences" && (
            <PreferencesTab initialLanguage={initialLanguage} />
          )}
          {activeTab === "account" && <AccountTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
