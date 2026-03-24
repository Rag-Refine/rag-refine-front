"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Database, Filter, LayoutGrid, Terminal, Trash2, Wrench } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "./components/ui/button";

const GlassPanel = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`bg-surface-lowest/60 backdrop-blur-xl border border-white/5 rounded-2xl ${className}`}>{children}</div>
);

export default function Home() {
  const t = useTranslations("Landing");

  const problems = [
    {
      icon: LayoutGrid,
      titleKey: "brokenTablesTitle" as const,
      descKey: "brokenTablesDesc" as const,
      color: "text-error",
      bg: "bg-error-container/20",
      borderColor: "hover:border-error/30",
    },
    {
      icon: Trash2,
      titleKey: "pollutionTitle" as const,
      descKey: "pollutionDesc" as const,
      color: "text-primary",
      bg: "bg-primary-container/20",
      borderColor: "hover:border-primary/30",
    },
    {
      icon: Wrench,
      titleKey: "burnoutTitle" as const,
      descKey: "burnoutDesc" as const,
      color: "text-secondary",
      bg: "bg-secondary/20",
      borderColor: "hover:border-secondary/30",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans selection:bg-primary/30">
      <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              RAG-Refine
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden md:flex p-2 text-on-surface-variant hover:bg-white/5 rounded-lg transition-all duration-200">
              <Terminal size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <Button href="/login" variant="ghost" className="px-4 py-2">
                {t("signIn")}
              </Button>
              <Button href="/signup" variant="primary" className="px-4 py-2">
                {t("createAccount")}
              </Button>
            </div>
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
                {t("badge")}
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                {t("heroTitle1")} <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-container to-secondary">
                  {t("heroTitle2")}
                </span>
              </h1>

              <p className="text-xl text-on-surface-variant max-w-xl leading-relaxed">
                {t("heroDescription")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button href="/signup" variant="primary" className="px-6 py-3">
                  {t("getStarted")}
                </Button>
                <Button href="/login" variant="secondary" className="px-6 py-3">
                  {t("signIn")}
                </Button>
              </div>

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
              <h2 className="text-3xl font-bold tracking-tight mb-4">{t("taxTitle")}</h2>
              <p className="text-on-surface-variant">{t("taxDescription")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {problems.map((feature, idx) => (
                <motion.div
                  key={feature.titleKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-8 rounded-2xl bg-surface-container border border-white/5 ${feature.borderColor} transition-all group`}
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-6`}>
                    <feature.icon className={feature.color} size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{t(feature.titleKey)}</h3>
                  <p className="text-on-surface-variant leading-relaxed">{t(feature.descKey)}</p>
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
                  <h3 className="text-2xl font-bold mb-4">{t("tableRecoveryTitle")}</h3>
                  <p className="text-on-surface-variant mb-8">
                    {t("tableRecoveryDesc")}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-secondary/10 border border-secondary/20 text-secondary text-xs rounded-full">{t("perfectMarkdown")}</span>
                    <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs rounded-full">{t("jsonSupport")}</span>
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
                  <h3 className="text-xl font-bold mb-3">{t("noiseRemovalTitle")}</h3>
                  <p className="text-on-surface-variant text-sm">{t("noiseRemovalDesc")}</p>
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
                  <h3 className="text-xl font-bold mb-3">{t("chunkingTitle")}</h3>
                  <p className="text-on-surface-variant text-sm">{t("chunkingDesc")}</p>
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
                    <h3 className="text-2xl font-bold mb-4">{t("developerFirstTitle")}</h3>
                    <p className="text-on-surface-variant">
                      {t("developerFirstDesc")}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-10">
              {t("integrationBanner")}
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
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#09090b] w-full border-t border-white/5 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:flex md:justify-between items-start text-xs tracking-wide text-slate-500">
          <div className="col-span-2 md:col-span-1 mb-8 md:mb-0">
            <span className="text-lg font-bold text-white mb-4 block">RAG-Refine</span>
            <p className="max-w-xs leading-relaxed mb-6">{t("footerTagline")}</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-emerald-400 transition-colors">
                {t("footerGithub")}
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors">
                {t("footerX")}
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-bold text-white text-xs uppercase tracking-widest mb-2">{t("footerProduct")}</span>
            <a href="#" className="hover:text-emerald-400 transition-colors">
              {t("footerFeatures")}
            </a>
            <a href="#" className="hover:text-emerald-400 transition-colors">
              {t("footerStatus")}
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-bold text-white text-xs uppercase tracking-widest mb-2">{t("footerCompany")}</span>
            <a href="#" className="hover:text-emerald-400 transition-colors">
              {t("footerPrivacy")}
            </a>
            <a href="#" className="hover:text-emerald-400 transition-colors">
              {t("footerSitemap")}
            </a>
            <a href="#" className="hover:text-emerald-400 transition-colors">
              {t("footerContact")}
            </a>
          </div>

          <div className="col-span-2 md:col-span-1 mt-12 md:mt-0 text-right">
            <p className="mb-2">{t("footerCopyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
