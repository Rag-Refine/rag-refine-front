import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/utils/supabase/server";
import { FileDropzone } from "@/app/components/dashboard/file-dropzone";
import { RecentActivityTable } from "@/app/components/dashboard/recent-activity-table";
import { ApiKeyCard } from "@/app/components/dashboard/api-key-card";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");
  return { title: t("dashboardTitle") };
}

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch account
  const { data: membership } = await supabase
    .from("account_members")
    .select("account_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/login");

  const accountId = membership.account_id;

  // Fetch recent jobs
  const { data: jobs } = await supabase
    .from("jobs")
    .select(
      "id, file_name, file_type, status, page_count, output_markdown, created_at"
    )
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch API keys
  const { data: apiKeys } = await supabase
    .from("api_keys")
    .select("id, key_prefix, label, created_at")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  const projectUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("supabase.co", "app") ||
    "https://api.rag-refine.com";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* File Upload Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-on-surface">
          {t("uploadDocuments")}
        </h2>
        <FileDropzone accountId={accountId} />
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-on-surface">
          {t("recentActivity")}
        </h2>
        <RecentActivityTable jobs={jobs || []} />
      </section>

      {/* API Key Card */}
      <section>
        <ApiKeyCard
          apiKeys={apiKeys || []}
          accountId={accountId}
          projectUrl={projectUrl}
        />
      </section>
    </div>
  );
}
