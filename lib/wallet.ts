import { createClient } from "@/lib/supabase/server";
import { databaseMessage, supabaseConfigured } from "@/lib/supabase/env";
import type { PayPortal, PayProcess, WalletEntry, WalletRecipient } from "@/lib/money";

function transferError(message: string) {
  const text = message.toLowerCase();
  if (text.includes("insufficient")) return "That amount is more than the balance.";
  if (text.includes("process")) return "Choose a process.";
  if (text.includes("portal")) return "Choose a portal.";
  if (text.includes("recipient")) return "Choose a recipient.";
  if (text.includes("amount")) return "Enter an amount from $0.01 to $1,000,000.";
  return "The transfer could not be sent.";
}

function creditError(message: string) {
  const text = message.toLowerCase();
  if (text.includes("amount")) return "Enter an amount from $0.01 to $1,000,000.";
  return "The funds could not be added.";
}

export async function loadWallet() {
  const empty = {
    balanceCents: 0,
    recipients: [] as WalletRecipient[],
    history: [] as WalletEntry[],
    error: "",
  };
  if (!supabaseConfigured()) return { ...empty, error: databaseMessage };
  const supabase = await createClient();
  if (!supabase) return { ...empty, error: databaseMessage };

  const [balance, recipients, history] = await Promise.all([
    supabase.rpc("wallet_balance"),
    supabase.rpc("transfer_recipients"),
    supabase.rpc("wallet_history"),
  ]);

  if (balance.error || recipients.error || history.error) {
    return { ...empty, error: "The wallet could not be loaded." };
  }

  const entries: WalletEntry[] = [];
  for (const row of (history.data ?? []) as {
    id: string;
    kind: string;
    amount_cents: number;
    other_name: string;
    created_at: string;
    process: string;
    portal: string;
  }[]) {
    if (row.kind !== "credit" && row.kind !== "out" && row.kind !== "in") continue;
    entries.push({
      id: row.id,
      kind: row.kind,
      amountCents: row.amount_cents,
      otherName: row.other_name,
      createdAt: row.created_at,
      process: payProcess(row.process),
      portal: payPortal(row.portal),
    });
  }

  return {
    balanceCents: typeof balance.data === "number" ? balance.data : 0,
    recipients: ((recipients.data ?? []) as { id: string; name: string; role: string }[]).map(
      (row) => ({ id: row.id, name: row.name, role: row.role }),
    ),
    history: entries,
    error: "",
  };
}

export async function listWalletRecords() {
  const empty = {
    balances: [] as { userId: string; cents: number }[],
    received: [] as { userId: string; cents: number }[],
    error: "",
  };
  if (!supabaseConfigured()) return { ...empty, error: databaseMessage };
  const supabase = await createClient();
  if (!supabase) return { ...empty, error: databaseMessage };

  const [wallets, transfers] = await Promise.all([
    supabase.from("wallets").select("user_id, balance_cents"),
    supabase.from("wallet_transfers").select("to_user, amount_cents"),
  ]);

  if (wallets.error || transfers.error) return { ...empty, error: "The wallet could not be loaded." };

  return {
    balances: ((wallets.data ?? []) as { user_id: string; balance_cents: number }[]).map((row) => ({
      userId: row.user_id,
      cents: row.balance_cents,
    })),
    received: ((transfers.data ?? []) as { to_user: string; amount_cents: number }[]).map((row) => ({
      userId: row.to_user,
      cents: row.amount_cents,
    })),
    error: "",
  };
}

export async function creditWallet(cents: number) {
  const supabase = await createClient();
  if (!supabase) return databaseMessage;
  const { error } = await supabase.rpc("credit_wallet", { cents });
  return error ? creditError(error.message) : "";
}

function payProcess(value: string): PayProcess {
  return value === "pending" || value === "payment" ? value : "";
}

function payPortal(value: string): PayPortal {
  if (
    value === "wire" ||
    value === "ach" ||
    value === "zelle" ||
    value === "venmo" ||
    value === "cashapp" ||
    value === "paypal" ||
    value === "crypto" ||
    value === "deposit"
  ) {
    return value;
  }
  return "";
}

export async function transferFunds(recipient: string, cents: number, process: PayProcess, portal: PayPortal) {
  const supabase = await createClient();
  if (!supabase) return databaseMessage;
  const { error } = await supabase.rpc("transfer_funds", {
    recipient,
    cents,
    pay_process: process,
    pay_portal: portal,
  });
  return error ? transferError(error.message) : "";
}

function payoutError(message: string) {
  const text = message.toLowerCase();
  if (text.includes("insufficient")) return "That amount is more than the balance.";
  if (text.includes("amount")) return "Enter an amount from $0.01 to $1,000,000.";
  return "The payout could not be sent.";
}

export async function reservePayout(method: "ach" | "crypto", cents: number, hint: string) {
  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage, id: "" };
  const { data, error } = await supabase.rpc("reserve_payout", {
    payout_method: method,
    cents,
    destination: hint,
  });
  if (error || typeof data !== "string") return { error: error ? payoutError(error.message) : payoutError(""), id: "" };
  return { error: "", id: data };
}

export async function settlePayout(id: string, provider: string, providerId: string) {
  const supabase = await createClient();
  if (!supabase) return databaseMessage;
  const { error } = await supabase.rpc("settle_payout", {
    payout_id: id,
    payout_provider: provider,
    payout_provider_id: providerId,
  });
  return error ? "The payout could not be sent." : "";
}

export async function releasePayout(id: string) {
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.rpc("release_payout", { payout_id: id });
}

export type OwnPayout = {
  id: string;
  method: "ach" | "crypto";
  amountCents: number;
  status: "pending" | "sent" | "failed";
  hint: string;
  createdAt: string;
};

export async function listOwnPayouts() {
  const empty = { items: [] as OwnPayout[], error: "" };
  if (!supabaseConfigured()) return { ...empty, error: databaseMessage };
  const supabase = await createClient();
  if (!supabase) return { ...empty, error: databaseMessage };
  const { data, error } = await supabase
    .from("wallet_payouts")
    .select("id, method, amount_cents, status, destination_hint, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return { ...empty, error: "The wallet could not be loaded." };
  const items: OwnPayout[] = [];
  for (const row of (data ?? []) as {
    id: string;
    method: string;
    amount_cents: number;
    status: string;
    destination_hint: string;
    created_at: string;
  }[]) {
    if (row.method !== "ach" && row.method !== "crypto") continue;
    if (row.status !== "pending" && row.status !== "sent" && row.status !== "failed") continue;
    items.push({
      id: row.id,
      method: row.method,
      amountCents: row.amount_cents,
      status: row.status,
      hint: row.destination_hint,
      createdAt: row.created_at,
    });
  }
  return { items, error: "" };
}
