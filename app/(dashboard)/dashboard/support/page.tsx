import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { SupportPageClient } from "./support-page-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Support");
  return { title: `${t("title")} — RAG-Refine` };
}

export default function SupportPage() {
  return <SupportPageClient />;
}
