import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Sidebar } from "@/app/components/dashboard/sidebar";
import { Header } from "@/app/components/dashboard/header";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch account membership
  const { data: membership } = await supabase
    .from("account_members")
    .select("account_id, role, accounts(id, account_name, plan)")
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/login");

  const account = membership.accounts as unknown as {
    id: string;
    account_name: string;
    plan: string;
  };

  // Fetch usage stats: total pages processed this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: usageData } = await supabase
    .from("jobs")
    .select("page_count")
    .eq("account_id", account.id)
    .gte("created_at", startOfMonth.toISOString());

  const pagesUsed = usageData?.reduce((sum, j) => sum + (j.page_count || 0), 0) ?? 0;
  const pagesLimit = account.plan === "pro" ? 10000 : 2000;

  const userName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "User";

  return (
    <div className="flex h-screen bg-background text-on-surface">
      <Sidebar accountPlan={account.plan} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          userName={userName}
          userEmail={user.email || ""}
          pagesUsed={pagesUsed}
          pagesLimit={pagesLimit}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
