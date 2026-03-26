import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Settings");
  return { title: t("metaTitle") };
}

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Layout already guards auth, but be defensive.
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, preferred_language")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <SettingsClient
      userEmail={user.email ?? ""}
      initialFullName={profile?.full_name ?? ""}
      initialLanguage={profile?.preferred_language ?? "en"}
    />
  );
}
