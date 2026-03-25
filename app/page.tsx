"use client";

import type { ReactNode } from "react";
import { useActionState, useEffect } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Database, Filter, LayoutGrid, Loader2, Terminal, Trash2, Wrench } from "lucide-react";
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

function WaitlistCard() {
  const [state, action, isPending] = useActionState<WaitlistState, FormData>(joinWaitlist, {});

  useEffect(() => {
    if (state.success) {
      toast.success("You're on the list!");
    }
  }, [state.success, state.formKey]);

  useEffect(() => {
    if (state.error) {
      toast.error(ERROR_MESSAGES[state.error] ?? state.error);
    }
  }, [state.error, state.formKey]);

  return (
    <div className="w-full max-w-md">
      <GlassPanel className="p-6 border-primary/20 shadow-[0_0_24px_rgba(173,198,255,0.12)]">
        <p className="text-base font-bold text-on-surface mb-1">Join the Private Beta</p>
        <p className="text-sm text-on-surface-variant mb-5">Secure 500 free pages on launch.</p>
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
            {isPending ? "Joining..." : "Get Early Access"}
          </button>
        </form>
      </GlassPanel>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-on-surface font-sans selection:bg-primary/30">
      <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              RAG-Refine
            </span>
            {/* <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              {['Features', 'Solutions', 'Pricing', 'Documentation'].map((item) => (
                <a key={item} href="#" className="text-on-surface-variant hover:text-on-surface transition-colors">
                  {item}
                </a>
              ))}
            </div> */}
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden md:flex p-2 text-on-surface-variant hover:bg-white/5 rounded-lg transition-all duration-200">
              <Terminal size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24 overflow-hidden">
        <section className="relative px-6 py-20 lg:py-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary rounded-full blur-[120px]" />
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-high border border-white/5 text-xs font-semibold text-secondary">
                <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse" />
                LLM-Optimized Infrastructure
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                Garbage In, <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-container to-secondary">
                  Garbage Out.
                </span>
              </h1>

              <p className="text-xl text-on-surface-variant max-w-xl leading-relaxed">
                Stop feeding your LLM noisy data. Convert messy PDFs, complex tables, and cluttered web docs into clean,
                structured Markdown ready for RAG.
              </p>

              <WaitlistCard />

            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur-2xl transition duration-1000 group-hover:duration-200 group-hover:opacity-100" />

              <div className="relative grid grid-cols-1 gap-4 lg:-rotate-2 hover:rotate-0 transition-transform duration-500">
                <GlassPanel className="p-4 shadow-2xl">
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <span className="text-xs font-mono text-slate-500">Source: messy_financials.pdf</span>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                    </div>
                  </div>
                  <div className="font-mono text-sm text-slate-400 space-y-1">
                    <p className="line-through opacity-30">Page 1 of 42 (Confidential)</p>
                    <p>Table 1.1 Summary | Q3 Profit Loss</p>
                    <p className="text-red-400/80">Jan | Feb | Mar (Total)</p>
                    <p>120.30 .. 140.00 .. 150.25 (410.55)</p>
                    <p className="opacity-30">Footer: 2023 Corporate Audit Services Inc.</p>
                  </div>
                </GlassPanel>

                <GlassPanel className="border-l-2 border-secondary p-4 shadow-2xl ml-8 -mt-4 bg-surface-lowest/90">
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <span className="text-xs font-mono text-secondary">Output: llm_ready.md</span>
                    <CheckCircle2 className="text-secondary" size={16} />
                  </div>
                  <div className="font-mono text-sm text-on-surface space-y-1">
                    <p className="text-primary">## Q3 Financial Summary</p>
                    <p>| Month | Amount |</p>
                    <p>| :--- | :--- |</p>
                    <p>| January | 120.30 |</p>
                    <p>| February | 140.00 |</p>
                    <p>| March | 150.25 |</p>
                    <p className="text-secondary font-bold">**Total: 410.55**</p>
                  </div>
                </GlassPanel>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-surface-low/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-3xl font-bold tracking-tight mb-4">The Context Window Tax</h2>
              <p className="text-on-surface-variant">Messy data doesn&apos;t just lower LLM quality—it costs you tokens and developer time.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: LayoutGrid,
                  title: "Broken Tables",
                  desc: "Standard PDF parsers treat tables as raw text strings, causing hallucination spikes during retrieval.",
                  color: "text-error",
                  bg: "bg-error-container/20",
                  borderColor: "hover:border-error/30",
                },
                {
                  icon: Trash2,
                  title: "Document Pollution",
                  desc: "Headers, footers, and legal disclaimers fill your vector database with semantic noise.",
                  color: "text-primary",
                  bg: "bg-primary-container/20",
                  borderColor: "hover:border-primary/30",
                },
                {
                  icon: Wrench,
                  title: "Engineer Burnout",
                  desc: "Engineers shouldn&apos;t spend 60% of their time writing custom regex for specific document formats.",
                  color: "text-secondary",
                  bg: "bg-secondary/20",
                  borderColor: "hover:border-secondary/30",
                },
              ].map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-8 rounded-2xl bg-surface-container border border-white/5 ${feature.borderColor} transition-all group`}
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-6`}>
                    <feature.icon className={feature.color} size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="md:col-span-8 p-10 rounded-3xl bg-surface-high border border-white/5 relative overflow-hidden"
              >
                <div className="relative z-10 max-w-md">
                  <h3 className="text-2xl font-bold mb-4">Smart Table Recovery</h3>
                  <p className="text-on-surface-variant mb-8">
                    Our proprietary OCR-to-JSON engine reconstructs multi-page tables with absolute fidelity, maintaining cell
                    relationships for complex analytical queries.
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-secondary/10 border border-secondary/20 text-secondary text-xs rounded-full">Perfect Markdown</span>
                    <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs rounded-full">JSON Support</span>
                  </div>
                </div>
                <div
                  className="absolute right-0 bottom-0 w-1/2 h-full opacity-10 pointer-events-none"
                  style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="md:col-span-4 p-8 rounded-3xl bg-surface border border-white/5 flex flex-col justify-between"
              >
                <div>
                  <Filter className="text-secondary mb-6" size={32} />
                  <h3 className="text-xl font-bold mb-3">Semantic Noise-Removal</h3>
                  <p className="text-on-surface-variant text-sm">Stripping ads, sidebars, and navigation menus from web docs automatically.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="md:col-span-4 p-8 rounded-3xl bg-surface border border-white/5 flex flex-col justify-between"
              >
                <div>
                  <Database className="text-primary mb-6" size={32} />
                  <h3 className="text-xl font-bold mb-3">RAG-Ready Chunking</h3>
                  <p className="text-on-surface-variant text-sm">Semantic chunking designed for 32k to 128k context windows with smart overlap.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="md:col-span-8 p-10 rounded-3xl bg-gradient-to-br from-surface-high to-surface-container border border-white/5"
              >
                <div className="flex flex-col md:flex-row gap-10 items-center">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4">Developer First</h3>
                    <p className="text-on-surface-variant">
                      Deep integrations with the tools you already use. Native support for LangChain, LlamaIndex, and any Python project
                      via our high-performance REST API.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                      {/* <div className="flex items-center gap-2 bg-surface-lowest px-4 py-2 rounded-lg border border-white/5">
                        <Code size={16} className="text-secondary" />
                        <span className="text-sm font-mono text-slate-300">pip install rag-refine</span>
                      </div> */}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-10">
              Seamless Integration with your Vector Stack
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

        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Hobby
              <div className="p-8 rounded-3xl bg-surface border border-white/5 flex flex-col">
                <h3 className="text-lg font-bold mb-2">Hobby</h3>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold">$0</span>
                  <span className="text-on-surface-variant">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {['50 pages / month', 'Web Interface', 'Standard OCR'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-on-surface-variant">
                      <Check size={18} className="text-secondary" /> {item}
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" className="w-full">Get Started</Button>
              </div> */}

              {/* Pro (Featured)
              <div className="p-8 rounded-3xl bg-surface-high border border-primary relative shadow-2xl shadow-primary/10 flex flex-col md:scale-105 z-10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-on-primary text-[10px] font-bold tracking-widest uppercase rounded-full">
                  Most Popular
                </div>
                <h3 className="text-lg font-bold mb-2">Pro</h3>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold">$49</span>
                  <span className="text-on-surface-variant">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {['2,000 pages / month', 'Full API Access'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <Check size={18} className="text-primary" /> {item}
                    </li>
                  ))}
                  <li className="flex items-center gap-3 text-sm font-bold text-secondary">
                    <Sparkles size={18} className="text-secondary" /> Smart Chunking
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Check size={18} className="text-primary" /> Email Support
                  </li>
                </ul>
                <Button variant="primary" className="w-full">Upgrade Now</Button>
              </div> */}

              {/* Enterprise
              <div className="p-8 rounded-3xl bg-surface border border-white/5 flex flex-col">
                <h3 className="text-lg font-bold mb-2">Enterprise</h3>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold">Custom</span>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {['Unlimited processing', 'Custom SLAs', 'On-Premise Deployment'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-on-surface-variant">
                      <Check size={18} className="text-slate-500" /> {item}
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" className="w-full">Contact Sales</Button>
              </div> */}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#09090b] w-full border-t border-white/5 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:flex md:justify-between items-start text-xs tracking-wide text-slate-500">
          <div className="col-span-2 md:col-span-1 mb-8 md:mb-0">
            <span className="text-lg font-bold text-white mb-4 block">RAG-Refine</span>
            <p className="max-w-xs leading-relaxed mb-6">Building the infrastructure for high-fidelity LLM data ingestion.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-emerald-400 transition-colors">
                GitHub
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors">
                X
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-bold text-white text-xs uppercase tracking-widest mb-2">Product</span>
            <a href="#" className="hover:text-emerald-400 transition-colors">
              Features
            </a>
            <a href="#" className="hover:text-emerald-400 transition-colors">
              Status
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-bold text-white text-xs uppercase tracking-widest mb-2">Company</span>
            <a href="#" className="hover:text-emerald-400 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-emerald-400 transition-colors">
              Sitemap
            </a>
            <a href="#" className="hover:text-emerald-400 transition-colors">
              Contact
            </a>
          </div>

          <div className="col-span-2 md:col-span-1 mt-12 md:mt-0 text-right">
            <p className="mb-2">© 2025 RAG-Refine. Built for the terminal luminescence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
