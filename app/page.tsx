"use client";

import type { ReactNode } from "react";
import { useActionState, useEffect } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Shield,
  ShieldCheck,
  Eye,
  AlertTriangle,
  Loader2,
  FileSearch,
  GitMerge,
  Lock,
  Globe,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { joinWaitlist, type WaitlistState } from "@/app/actions/waitlist";

const GlassPanel = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`bg-surface-lowest/60 backdrop-blur-xl border border-white/5 rounded-2xl ${className}`}>{children}</div>
);

const ERROR_MESSAGES: Record<string, string> = {
  waitlistInvalidEmail: "Please enter a valid email address.",
  waitlistDuplicate: "You're already on the list.",
  waitlistError: "Something went wrong. Please try again.",
};

function ConfidenceBadge({ level }: { level: "high" | "medium" | "low" }) {
  const styles = {
    high: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    medium: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    low: "bg-red-500/15 border-red-500/30 text-red-400",
  };
  const labels = { high: "High Confidence", medium: "Medium Confidence", low: "Low Confidence" };
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${styles[level]} whitespace-nowrap`}>
      {labels[level]}
    </span>
  );
}

function WaitlistCard() {
  const [state, action, isPending] = useActionState<WaitlistState, FormData>(joinWaitlist, {});

  useEffect(() => {
    if (state.success) toast.success("You're on the list!");
  }, [state.success, state.formKey]);

  useEffect(() => {
    if (state.error) toast.error(ERROR_MESSAGES[state.error] ?? state.error);
  }, [state.error, state.formKey]);

  return (
    <div className="w-full max-w-md">
      <GlassPanel className="p-6 border-primary/20 shadow-[0_0_24px_rgba(173,198,255,0.12)]">
        <p className="text-base font-bold text-on-surface mb-1">Start Private Beta</p>
        <p className="text-sm text-on-surface-variant mb-5">500 pages free. No credit card required.</p>
        <form action={action} className="flex gap-2">
          <input
            key={state.formKey}
            type="email"
            name="email"
            placeholder="you@company.com"
            required
            className="flex-1 min-w-0 bg-surface-lowest border border-white/10 rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all whitespace-nowrap"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
            {isPending ? "Joining..." : "Get Access"}
          </button>
        </form>
      </GlassPanel>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-on-surface font-sans selection:bg-primary/30">
      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={22} className="text-primary" />
            <span className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              RAG-Refine
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
              <Globe size={11} />
              GDPR Ready · EU Data Residency
            </span>
            <a
              href="#benchmarks"
              className="hidden md:flex px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface border border-white/10 rounded-lg hover:border-white/20 transition-all"
            >
              Accuracy Benchmarks
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-24 overflow-hidden">
        {/* ── Hero ── */}
        <section className="relative px-6 py-20 lg:py-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-15 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[140px]" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-secondary rounded-full blur-[140px]" />
            <div className="absolute top-[30%] right-[20%] w-[20%] h-[20%] bg-blue-800 rounded-full blur-[100px]" />
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-high border border-white/8 text-xs font-semibold text-secondary">
                <Shield size={12} className="text-secondary" />
                RAG Data Assurance &amp; Trust Platform
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                Stop Hallucinating.
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-secondary">
                  Start Verifying.
                </span>
              </h1>

              <p className="text-xl text-on-surface-variant max-w-xl leading-relaxed">
                RAG-Refine is the first ingestion platform that <strong className="text-on-surface">audits document integrity</strong> for
                your AI Agents. Don&apos;t just parse PDFs—verify them with AI-powered confidence scoring and 99.9% data fidelity.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <WaitlistCard />
              </div>

              <a
                href="#benchmarks"
                className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4"
              >
                View Accuracy Benchmarks →
              </a>
            </motion.div>

            {/* Hero visual: confidence-scored output mock */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur-2xl transition duration-1000 group-hover:opacity-100" />

              <div className="relative grid grid-cols-1 gap-4 lg:-rotate-2 hover:rotate-0 transition-transform duration-500">
                <GlassPanel className="p-4 shadow-2xl">
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <span className="text-xs font-mono text-slate-500">audit: legal_contract_v3.pdf</span>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                    </div>
                  </div>

                  <div className="font-mono text-sm space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 text-on-surface">
                        <span className="text-primary font-bold">## Section 4.2 — Liability Cap</span>
                      </div>
                      <ConfidenceBadge level="high" />
                    </div>

                    <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/15 rounded-lg px-2 py-1.5">
                      <div className="flex-1 text-amber-200/80 text-xs leading-relaxed">
                        Total liability shall not exceed the fees paid in the <span className="bg-amber-400/20 px-0.5 rounded">preceding 12 [months?]</span> period.
                      </div>
                      <ConfidenceBadge level="medium" />
                    </div>

                    <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/15 rounded-lg px-2 py-1.5">
                      <div className="flex-1 text-red-300/80 text-xs leading-relaxed">
                        <span className="bg-red-400/20 px-0.5 rounded">Table 3-B [layout ambiguous — 4 cols merged]</span>
                      </div>
                      <ConfidenceBadge level="low" />
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-1 text-on-surface-variant text-xs">**Governing Law:** Delaware, United States.</div>
                      <ConfidenceBadge level="high" />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Extraction audit complete</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400">92% Confidence</span>
                      <CheckCircle2 size={14} className="text-emerald-400" />
                    </div>
                  </div>
                </GlassPanel>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Trust Layer: Confidence Scoring ── */}
        <section className="py-24 bg-surface-low/40 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-high border border-white/8 text-xs font-semibold text-primary">
                  <ShieldCheck size={12} />
                  Trust Layer
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">AI-Powered Confidence Scoring</h2>
                <p className="text-lg text-on-surface-variant leading-relaxed">
                  Every table and paragraph extracted receives a real-time reliability score. Our engine identifies ambiguous layouts and
                  potential <strong className="text-on-surface">hallucination triggers</strong> before they reach your Vector Database.
                </p>
                <ul className="space-y-4 text-sm text-on-surface-variant">
                  {[
                    { icon: CheckCircle2, text: "Per-block confidence scores on every extraction", color: "text-emerald-400" },
                    { icon: AlertTriangle, text: "Automatic flagging of merged cells and ambiguous layouts", color: "text-amber-400" },
                    { icon: Shield, text: "Pre-vectorization hallucination risk report", color: "text-primary" },
                  ].map(({ icon: Icon, text, color }) => (
                    <li key={text} className="flex items-start gap-3">
                      <Icon size={18} className={`${color} mt-0.5 flex-shrink-0`} />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Confidence score visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <GlassPanel className="p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/5">
                    <span className="text-xs font-mono text-slate-400">Confidence Audit Report</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold">Live</span>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      { label: "Headings", score: 99, color: "bg-emerald-500" },
                      { label: "Paragraphs", score: 97, color: "bg-emerald-500" },
                      { label: "Simple Tables", score: 94, color: "bg-emerald-500" },
                      { label: "Complex Tables", score: 79, color: "bg-amber-500" },
                      { label: "Scanned Images (OCR)", score: 62, color: "bg-red-500" },
                    ].map(({ label, score, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-on-surface-variant">{label}</span>
                          <span className="font-bold text-on-surface">{score}%</span>
                        </div>
                        <div className="h-1.5 bg-surface-high rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${score}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className={`h-full ${color} rounded-full`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> High ≥ 90%</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Medium 70–89%</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Low &lt; 70%</span>
                  </div>
                </GlassPanel>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Verification Loop: HITL ── */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Split-view mock */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                <GlassPanel className="p-0 overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between px-4 py-2 bg-surface-high border-b border-white/5">
                    <span className="text-xs font-mono text-slate-400">Split-View Audit — legal_contract_v3.pdf</span>
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500/50" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                      <div className="w-2 h-2 rounded-full bg-green-500/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-white/5">
                    {/* PDF side */}
                    <div className="p-4 space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Original PDF</p>
                      <div className="h-3 bg-surface-highest rounded w-3/4" />
                      <div className="h-2 bg-surface-highest rounded w-full opacity-60" />
                      <div className="h-2 bg-surface-highest rounded w-5/6 opacity-60" />
                      <div className="h-2 bg-surface-highest rounded w-4/5 opacity-60" />
                      <div className="mt-3 border border-amber-500/30 bg-amber-500/5 rounded p-2">
                        <div className="grid grid-cols-3 gap-1">
                          {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="h-2 bg-amber-500/20 rounded" />
                          ))}
                        </div>
                        <p className="text-[10px] text-amber-400 mt-1.5">⚠ Merged cell detected</p>
                      </div>
                      <div className="h-2 bg-surface-highest rounded w-2/3 opacity-60" />
                      <div className="h-2 bg-surface-highest rounded w-full opacity-60" />
                    </div>
                    {/* Markdown side */}
                    <div className="p-4 space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Extracted Markdown</p>
                      <p className="text-xs font-mono text-primary font-bold">## Section 4.2</p>
                      <p className="text-xs font-mono text-on-surface-variant leading-relaxed">Liability shall not exceed...</p>
                      <div className="mt-3 border border-red-500/30 bg-red-500/5 rounded p-2">
                        <p className="text-xs font-mono text-red-400">| Col A | Col B | Col C |</p>
                        <p className="text-xs font-mono text-red-400">| --- | --- | --- |</p>
                        <p className="text-[10px] text-red-400 mt-1.5">Needs human review</p>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <button className="flex-1 text-xs py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold hover:bg-emerald-500/25 transition-colors">
                          ✓ Approve
                        </button>
                        <button className="flex-1 text-xs py-1 rounded bg-red-500/15 border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/25 transition-colors">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-6 order-1 lg:order-2"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-high border border-white/8 text-xs font-semibold text-secondary">
                  <Eye size={12} />
                  Verification Loop
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Human-in-the-Loop Audit</h2>
                <p className="text-lg text-on-surface-variant leading-relaxed">
                  For mission-critical documents in Legal, Finance, or Healthcare, &ldquo;close enough&rdquo; isn&apos;t enough. Use our
                  split-view editor to visually verify extraction against the original PDF. Audit every token with full coordinate mapping.
                </p>
                <ul className="space-y-4 text-sm text-on-surface-variant">
                  {[
                    { icon: FileSearch, text: "Pixel-perfect PDF overlay with coordinate mapping", color: "text-primary" },
                    { icon: GitMerge, text: "Side-by-side diff for every block and table cell", color: "text-secondary" },
                    { icon: Lock, text: "Audit trail with full reviewer sign-off history", color: "text-slate-400" },
                  ].map(({ icon: Icon, text, color }) => (
                    <li key={text} className="flex items-start gap-3">
                      <Icon size={18} className={`${color} mt-0.5 flex-shrink-0`} />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Comparison Table ── */}
        <section id="benchmarks" className="py-24 bg-surface-low/40 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-high border border-white/8 text-xs font-semibold text-primary mb-6">
                <ShieldCheck size={12} />
                Accuracy Benchmarks
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">The Safe Choice for Enterprise AI</h2>
              <p className="text-on-surface-variant">
                Generic parsers extract. RAG-Refine verifies. See what matters when your AI cannot afford to be wrong.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-4 text-on-surface-variant font-medium w-1/3" />
                    <th className="p-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold text-xs uppercase tracking-wider">
                          RAG-Refine
                        </span>
                        <span className="text-[10px] text-slate-500">Trust Platform</span>
                      </div>
                    </th>
                    <th className="p-4 text-center text-on-surface-variant font-medium">Generic Parsers</th>
                    <th className="p-4 text-center text-on-surface-variant font-medium">API-Only Services</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    {
                      feature: "Confidence Audit",
                      rr: true,
                      generic: false,
                      api: false,
                    },
                    {
                      feature: "Split-View Verification",
                      rr: true,
                      generic: false,
                      api: false,
                    },
                    {
                      feature: "PII Masking",
                      rr: true,
                      generic: false,
                      api: "partial",
                    },
                    {
                      feature: "EU Data Residency",
                      rr: true,
                      generic: false,
                      api: false,
                    },
                    {
                      feature: "Human-in-the-Loop Review",
                      rr: true,
                      generic: false,
                      api: false,
                    },
                    {
                      feature: "Hallucination Risk Report",
                      rr: true,
                      generic: false,
                      api: false,
                    },
                    {
                      feature: "Quality Score per Block",
                      rr: true,
                      generic: false,
                      api: false,
                    },
                    {
                      feature: "Raw Text Extraction",
                      rr: true,
                      generic: true,
                      api: true,
                    },
                  ].map(({ feature, rr, generic, api }) => {
                    const Cell = ({ val }: { val: boolean | string }) =>
                      val === true ? (
                        <CheckCircle2 size={18} className="text-emerald-400 mx-auto" />
                      ) : val === "partial" ? (
                        <span className="text-amber-400 text-xs font-semibold">Partial</span>
                      ) : (
                        <X size={16} className="text-slate-600 mx-auto" />
                      );

                    return (
                      <tr key={feature} className="hover:bg-surface-high/30 transition-colors">
                        <td className="p-4 text-on-surface-variant">{feature}</td>
                        <td className="p-4 text-center bg-primary/5">
                          <Cell val={rr} />
                        </td>
                        <td className="p-4 text-center">
                          <Cell val={generic} />
                        </td>
                        <td className="p-4 text-center">
                          <Cell val={api} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Problems / Pain Points ── */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">The Hidden Cost of Unverified Ingestion</h2>
              <p className="text-on-surface-variant">Every ambiguous table and noisy footer is a liability in production.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: AlertTriangle,
                  title: "Silent Hallucinations",
                  desc: "Merged table cells and corrupted columns create confident-sounding but wrong answers. You won't know until a client reports it.",
                  color: "text-error",
                  bg: "bg-error-container/20",
                  borderColor: "hover:border-error/30",
                },
                {
                  icon: Shield,
                  title: "Compliance Exposure",
                  desc: "PII leaking into vector databases and US-only data processing puts GDPR and HIPAA compliance at risk.",
                  color: "text-primary",
                  bg: "bg-primary-container/20",
                  borderColor: "hover:border-primary/30",
                },
                {
                  icon: Eye,
                  title: "Zero Auditability",
                  desc: "Black-box parsing leaves no trace for regulators, auditors, or your own engineers when something goes wrong.",
                  color: "text-secondary",
                  bg: "bg-secondary/20",
                  borderColor: "hover:border-secondary/30",
                },
              ].map((card, idx) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-8 rounded-2xl bg-surface-container border border-white/5 ${card.borderColor} transition-all`}
                >
                  <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center mb-6`}>
                    <card.icon className={card.color} size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed">{card.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Integrations bar ── */}
        <section className="py-16 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-10">
              Verified output, ready for your Vector Stack
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {["Pinecone", "Weaviate", "Milvus", "Supabase", "MongoDB"].map((logo) => (
                <span key={logo} className="text-2xl font-bold">
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-32 px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-high border border-white/8 text-xs font-semibold text-secondary">
              <ShieldCheck size={12} />
              Private Beta · Limited Access
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
              Your AI is only as good as the data it trusts.
            </h2>
            <p className="text-xl text-on-surface-variant">
              Join the companies using RAG-Refine to make their AI agents verifiably reliable.
            </p>
            <div className="flex justify-center">
              <WaitlistCard />
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#09090b] w-full border-t border-white/5 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:flex md:justify-between items-start text-xs tracking-wide text-slate-500 mb-10">
            <div className="col-span-2 md:col-span-1 mb-8 md:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={18} className="text-primary" />
                <span className="text-lg font-bold text-white">RAG-Refine</span>
              </div>
              <p className="max-w-xs leading-relaxed mb-4">
                The first RAG ingestion platform built for verifiability, quality assurance, and enterprise trust.
              </p>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/8 text-emerald-400 text-xs font-semibold w-fit mb-4">
                <Globe size={11} />
                GDPR Ready · EU Data Residency
              </div>
              <div className="flex gap-4">
                <a href="#" className="hover:text-emerald-400 transition-colors">GitHub</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">X</a>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-bold text-white text-xs uppercase tracking-widest mb-2">Product</span>
              <a href="#" className="hover:text-emerald-400 transition-colors">Features</a>
              <a href="#benchmarks" className="hover:text-emerald-400 transition-colors">Benchmarks</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Status</a>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-bold text-white text-xs uppercase tracking-widest mb-2">Company</span>
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Security</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Contact</a>
            </div>

            <div className="col-span-2 md:col-span-1 mt-12 md:mt-0 text-right">
              <p className="mb-2">
                © {new Date().getFullYear()} RAG-Refine. Built for enterprise AI
                trust.
              </p>
              <p className="text-slate-600">
                EU Data Residency · GDPR Compliant · SOC2 (in progress)
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
