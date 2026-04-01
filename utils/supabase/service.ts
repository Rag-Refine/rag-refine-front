import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS.
 * Only use in trusted server contexts (e.g. webhook handlers).
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
