import { createClient } from "@/lib/supabase/server";

export type DashboardAlerts = {
  messages: boolean;
  team: boolean;
  wallet: boolean;
  onboarding: boolean;
};

const none: DashboardAlerts = {
  messages: false,
  team: false,
  wallet: false,
  onboarding: false,
};

function isNewer(createdAt: string | undefined, seenAt: string | undefined) {
  if (!createdAt) return false;
  if (!seenAt) return true;
  return createdAt > seenAt;
}

export async function loadDashboardAlerts(userId: string, admin: boolean): Promise<DashboardAlerts> {
  const supabase = await createClient();
  if (!supabase) return none;

  const [seen, incoming, messages, chats, pendingAccounts, pendingForms] = await Promise.all([
    supabase.from("nav_seen").select("section, seen_at").eq("user_id", userId),
    supabase
      .from("wallet_transfers")
      .select("created_at")
      .eq("to_user", userId)
      .order("created_at", { ascending: false })
      .limit(1),
    admin
      ? supabase.from("messages").select("created_at").order("created_at", { ascending: false }).limit(1)
      : Promise.resolve({ data: [], error: null }),
    admin
      ? supabase.from("chats").select("created_at").order("created_at", { ascending: false }).limit(1)
      : Promise.resolve({ data: [], error: null }),
    admin
      ? supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "pending")
      : Promise.resolve({ count: 0, error: null }),
    admin
      ? supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending")
      : Promise.resolve({ count: 0, error: null }),
  ]);

  const seenAt = new Map(
    ((seen.data ?? []) as { section: string; seen_at: string }[]).map((row) => [row.section, row.seen_at]),
  );
  const latest = (rows: { created_at: string }[] | null) => rows?.[0]?.created_at;

  return {
    messages:
      admin &&
      (isNewer(latest((messages.data ?? []) as { created_at: string }[]), seenAt.get("messages")) ||
        isNewer(latest((chats.data ?? []) as { created_at: string }[]), seenAt.get("messages"))),
    team: admin && (pendingAccounts.count ?? 0) > 0,
    wallet: isNewer(latest((incoming.data ?? []) as { created_at: string }[]), seenAt.get("wallet")),
    onboarding: admin && (pendingForms.count ?? 0) > 0,
  };
}

export async function markNavSeen(userId: string, section: "messages" | "wallet") {
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.from("nav_seen").upsert(
    { user_id: userId, section, seen_at: new Date().toISOString() },
    { onConflict: "user_id,section" },
  );
}
