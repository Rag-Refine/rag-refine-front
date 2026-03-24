"use client";

import Link from "next/link";
import { ArrowLeft, Github } from "lucide-react";
import { useMemo, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { Button } from "../../components/ui/button";

type Errors = {
  name?: string;
  email?: string;
  password?: string;
};

export default function SignupPage() {
  const [errors, setErrors] = useState<Errors>({});
  const [password, setPassword] = useState("");

  const strengthLabel = useMemo(() => {
    if (!password) return "";
    if (password.length >= 12 && /[A-Z]/.test(password) && /\d/.test(password)) return "Strong";
    if (password.length >= 8) return "Medium";
    return "Weak";
  }, [password]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextErrors: Errors = {};

    if (!String(formData.get("name") || "").trim()) nextErrors.name = "Full name is required";
    if (!String(formData.get("email") || "").trim()) nextErrors.email = "Email is required";
    if (!String(formData.get("password") || "").trim()) nextErrors.password = "Password is required";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      console.log("signup", Object.fromEntries(formData.entries()));
    }
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <Link href="/" className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-100">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="mx-auto w-full max-w-xl rounded-2xl border border-white/5 bg-[#18181b] p-8 shadow-[0_18px_60px_-30px_rgba(59,130,246,0.6)]">
        <div className="space-y-2 text-left">
          <p className="text-sm font-semibold text-[#3b82f6]">RAG-Refine</p>
          <h1 className="text-3xl font-bold text-white">Create an account</h1>
          <p className="text-sm text-zinc-400">Start cleaning your RAG data for free today</p>
        </div>

        <div className="mt-8 grid gap-3">
          <SocialButton label="Sign up with GitHub" icon={<Github size={18} />} />
          <SocialButton
            label="Sign up with Google"
            icon={<GoogleGlyph />}
            className="border-zinc-700/80 hover:border-[#3b82f6]/50"
          />
        </div>

        <Separator label="OR" />

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <InputField id="name" name="name" label="Full Name" placeholder="Ada Lovelace" error={errors.name} />
          <InputField
            id="email"
            name="email"
            label="Email"
            type="email"
            placeholder="you@company.com"
            error={errors.email}
          />
          <div className="space-y-2">
            <InputField
              id="password"
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Password strength</span>
              <span className={strengthColor(strengthLabel)}>{strengthLabel || ""}</span>
            </div>
          </div>

          <Button type="submit" className="mt-2 w-full justify-center">
            Create Account
          </Button>
        </form>

        <p className="mt-4 text-[11px] leading-relaxed text-zinc-500">
          By clicking continue, you agree to our <span className="text-zinc-200">Terms of Service</span> and <span className="text-zinc-200">Privacy Policy</span>.
        </p>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#3b82f6] hover:text-[#60a5fa]">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

function SocialButton({ label, icon, className = "" }: { label: string; icon: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      className={`flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-[#0f0f11] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-[#3b82f6]/40 hover:bg-[#111116] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b82f6] ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}

function InputField(
  { label, error, className = "", ...props }: { label?: string; error?: string; className?: string } & InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={props.id} className="text-sm text-zinc-300">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-lg border bg-[#101013] px-4 py-3 text-sm text-white placeholder:text-zinc-500 transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/40 focus:outline-none ${
          error ? "border-red-500/60 ring-2 ring-red-500/30" : "border-zinc-800"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function Separator({ label }: { label: string }) {
  return (
    <div className="mt-8 mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
      {label}
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
    </div>
  );
}

function GoogleGlyph() {
  return (
    <span className="relative inline-flex h-5 w-5 items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-white" />
      <svg viewBox="0 0 24 24" className="relative h-4 w-4">
        <path fill="#EA4335" d="M11.99 10.2v3.6h5.03c-.22 1.2-.9 2.22-1.93 2.9l3.12 2.42c1.83-1.68 2.89-4.16 2.89-7.08 0-.68-.06-1.34-.18-1.97H12z" />
        <path fill="#34A853" d="M6.53 14.32a5.4 5.4 0 0 1-.3-1.72c0-.6.11-1.19.3-1.72l-3.12-2.42a9.516 9.516 0 0 0 0 8.28z" />
        <path fill="#4A90E2" d="M11.99 18.5c1.62 0 2.97-.54 3.96-1.48l-3.12-2.42c-.44.3-1.01.48-1.84.48-1.41 0-2.6-.95-3.03-2.23l-3.12 2.42C6.34 17.26 8.87 18.5 11.99 18.5z" />
        <path fill="#FBBC05" d="M11.99 6.53c.88 0 1.67.3 2.29.88l1.71-1.7c-1.02-.96-2.36-1.55-4-1.55-3.12 0-5.65 1.73-6.85 4.25l3.12 2.42C8.93 7.48 10.52 6.53 11.99 6.53z" />
      </svg>
    </span>
  );
}

function strengthColor(label: string) {
  if (label === "Strong") return "text-emerald-400";
  if (label === "Medium") return "text-amber-300";
  if (label === "Weak") return "text-red-400";
  return "text-zinc-500";
}
