"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/utils/supabase/server";

export type SignupState = {
  error?: string;
  formKey?: number;
  fields?: {
    full_name?: string;
    account_name?: string;
    email?: string;
  };
};

export async function signup(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const t = await getTranslations("Errors");

  const fullName = String(formData.get("full_name") || "").trim();
  const accountName = String(formData.get("account_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const confirmPassword = String(formData.get("confirm_password") || "").trim();

  const fields = { full_name: fullName, account_name: accountName, email };

  const formKey = Date.now();

  if (!fullName || !accountName || !email || !password || !confirmPassword) {
    return { error: t("allFieldsRequired"), formKey, fields };
  }

  if (password !== confirmPassword) {
    return { error: t("passwordsDoNotMatch"), formKey, fields };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        account_name: accountName,
      },
    },
  });

  if (error) {
    return { error: error.message, formKey: Date.now(), fields };
  }

  redirect("/dashboard");
}
