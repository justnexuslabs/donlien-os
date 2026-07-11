import { createClient } from "@supabase/supabase-js";

export type LienRecord = {
  id: string;
  lien_id: string;
  human_name: string;
  lien_name: string;
  role: string;
  portrait_url: string | null;
  portrait_data_url: string | null;
  genesis_status: string;
  hedera_account_id: string | null;
  x_post_url: string | null;
  created_at: string;
};

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
