import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Sidebar } from "@/app/components/dashboard/sidebar";
import { Header } from "@/app/components/dashboard/header";
import { Toaster } from "sonner";

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
    .select(
      "account_id, role, accounts(id, account_name, plan, pages_consumed, monthly_page_limit, quota_reset_date)",
    )
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/login");

  const account = membership.accounts as unknown as {
    id: string;
    account_name: string;
    plan: string;
    pages_consumed: number;
    monthly_page_limit: number;
    quota_reset_date: string;
  };

  // Roll the 30-day window forward if it has expired. The RPC is a
  // no-op when the window is still active.
  const { data: quotaData } = await supabase.rpc("reset_quota_if_expired", {
    p_account_id: account.id,
  });
  const quota = quotaData as {
    ok: boolean;
    pages_consumed?: number;
    monthly_page_limit?: number;
  } | null;

  const pagesUsed =
    (quota?.ok && typeof quota.pages_consumed === "number"
      ? quota.pages_consumed
      : account.pages_consumed) ?? 0;
  const pagesLimit =
    (quota?.ok && typeof quota.monthly_page_limit === "number"
      ? quota.monthly_page_limit
      : account.monthly_page_limit) ?? 2000;

  const userName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "User";

  return (
    <div className="flex h-screen bg-background text-on-surface">
      <Toaster position="bottom-right" theme="dark" />
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
