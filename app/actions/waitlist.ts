"use server";

import { createClient } from "@/utils/supabase/server";

export type WaitlistState = {
  error?: string;
  success?: boolean;
  formKey?: number;
};

export async function joinWaitlist(
  _prevState: WaitlistState,
  formData: FormData
): Promise<WaitlistState> {
  const email = formData.get("email")?.toString().trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "waitlistInvalidEmail" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("waitlist").insert({ email });

  if (error) {
    if (error.code === "23505") {
      return { error: "waitlistDuplicate" };
    }
    return { error: "waitlistError" };
  }

  return { success: true, formKey: Date.now() };
}
