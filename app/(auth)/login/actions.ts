"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/utils/supabase/server";

export type LoginState = {
  error?: string;
  formKey?: number;
  fields?: {
    email?: string;
  };
};

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const t = await getTranslations("Errors");

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  const fields = { email };
  const formKey = Date.now();

  if (!email || !password) {
    return { error: t("emailPasswordRequired"), formKey, fields };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message, formKey: Date.now(), fields };
  }

  redirect("/dashboard");
}
