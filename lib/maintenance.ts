import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export async function siteIsClosed() {
  if (!supabaseConfigured()) return false;
  const supabase = await createClient();
  if (!supabase) return false;
  const { data } = await supabase.from("site_status").select("maintenance").eq("id", "site").maybeSingle();
  return Boolean(data?.maintenance);
}

export const supportIsOnline = cache(async function supportIsOnline() {
  if (!supabaseConfigured()) return false;
  const supabase = await createClient();
  if (!supabase) return false;
  const { data } = await supabase.from("site_status").select("support_online").eq("id", "site").maybeSingle();
  return Boolean(data?.support_online);
});
