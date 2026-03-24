import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { SidebarHistory } from "@/app/components/dashboard/sidebar-history";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("History");
  return { title: `${t("title")} — RAG-Refine` };
}

export default function HistoryPage() {
  return (
    <div className="h-full max-w-2xl">
      <SidebarHistory />
    </div>
  );
}
