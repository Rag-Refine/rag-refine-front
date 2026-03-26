import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/utils/supabase/server";
import { ApiKeysManager } from "./api-keys-manager";

export async function generateMetadata() {
  const t = await getTranslations("ApiKeys");
  return { title: t("metaTitle") };
}

export default async function ApiKeysPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("account_members")
    .select("account_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/login");

  const { data: apiKeys } = await supabase
    .from("api_keys")
    .select("id, name, key_display, last_used_at, created_at")
    .eq("account_id", membership.account_id)
    .order("created_at", { ascending: false });

  return (
    <ApiKeysManager
      apiKeys={apiKeys || []}
      accountId={membership.account_id}
    />
  );
}
