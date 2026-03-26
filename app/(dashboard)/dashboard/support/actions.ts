"use server";

import { createClient } from "@/utils/supabase/server";

export type TicketState = {
  error?: string;
  success?: boolean;
};

export async function submitTicket(
  _prev: TicketState,
  formData: FormData
): Promise<TicketState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { error: "Unauthenticated" };

  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  if (!subject) return { error: "Please select a subject." };
  if (!message || message.length < 20)
    return { error: "Message must be at least 20 characters." };

  const { error } = await supabase.from("support_tickets").insert({
    user_id: user.id,
    subject,
    message,
  });

  if (error) return { error: "Failed to submit. Please try again." };
  return { success: true };
}
