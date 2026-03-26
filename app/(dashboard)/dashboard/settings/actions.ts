"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/utils/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SettingsActionState = {
  error?: string;
  success?: string;
};

// ── Update Profile ────────────────────────────────────────────────────────────

export async function updateProfile(
  _prevState: SettingsActionState | Record<string, never>,
  formData: FormData
): Promise<SettingsActionState> {
  const t = await getTranslations("Settings");
  const tErr = await getTranslations("Errors");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tErr("notAuthenticated") };

  const fullName = (formData.get("full_name") as string | null)?.trim() ?? "";

  const { error } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, full_name: fullName },
      { onConflict: "id" }
    );

  if (error) return { error: t("notifications.error") };

  revalidatePath("/dashboard/settings");
  return { success: t("notifications.profileSaved") };
}

// ── Update Preferences ────────────────────────────────────────────────────────

export async function updatePreferences(
  _prevState: SettingsActionState | Record<string, never>,
  formData: FormData
): Promise<SettingsActionState> {
  const t = await getTranslations("Settings");
  const tErr = await getTranslations("Errors");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tErr("notAuthenticated") };

  const preferredLanguage =
    (formData.get("preferred_language") as string | null) ?? "en";

  const { error } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, preferred_language: preferredLanguage },
      { onConflict: "id" }
    );

  if (error) return { error: t("notifications.error") };

  revalidatePath("/dashboard/settings");
  return { success: t("notifications.preferencesSaved") };
}

// ── Delete Account ────────────────────────────────────────────────────────────
// Deletes public-schema data then removes the auth user via the service-role
// client (requires SUPABASE_SERVICE_ROLE_KEY in the server environment).

export async function deleteAccount(
  _prevState: SettingsActionState | Record<string, never>,
  _formData: FormData
): Promise<SettingsActionState> {
  const t = await getTranslations("Settings");
  const tErr = await getTranslations("Errors");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: tErr("notAuthenticated") };

  const userId = user.id;

  // Delete public-schema rows tied to this user.
  // The profiles FK cascades from auth.users, but we also clean up explicitly.
  await supabase.from("profiles").delete().eq("id", userId);
  await supabase.from("api_keys").delete().eq("user_id", userId);
  await supabase.from("jobs").delete().eq("user_id", userId);

  // Remove from account_members; if user was the only member, delete the account too.
  const { data: memberships } = await supabase
    .from("account_members")
    .select("account_id")
    .eq("user_id", userId);

  if (memberships) {
    for (const m of memberships) {
      const { count } = await supabase
        .from("account_members")
        .select("id", { count: "exact", head: true })
        .eq("account_id", m.account_id);

      if (count === 1) {
        // Last member — delete the account entirely (cascades account_members)
        await supabase.from("accounts").delete().eq("id", m.account_id);
      } else {
        await supabase
          .from("account_members")
          .delete()
          .eq("user_id", userId)
          .eq("account_id", m.account_id);
      }
    }
  }

  // Delete the auth.users row via service-role client (requires env var).
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    const cookieStore = await cookies();
    const adminClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );
    await adminClient.auth.admin.deleteUser(userId);
  } else {
    // Fallback: sign out so the session is invalidated immediately.
    await supabase.auth.signOut();
  }

  redirect("/");
}
