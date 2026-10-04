"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { dollarsToCents } from "@/lib/money";
import {
  cryptoReady,
  loadBankAccount,
  payoutAsset,
  sendAch,
  sendCrypto,
  startBankSetup,
} from "@/lib/payouts";
import { createClient } from "@/lib/supabase/server";
import { databaseMessage } from "@/lib/supabase/env";
import { creditWallet, releasePayout, reservePayout, settlePayout, transferFunds } from "@/lib/wallet";

export type WalletState = { error: string };

export async function addFundsAction(_prev: WalletState, formData: FormData): Promise<WalletState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { error: "The funds could not be added." };

  const cents = dollarsToCents(String(formData.get("amount") ?? ""));
  if (cents === null) return { error: "Enter an amount from $0.01 to $1,000,000." };

  const error = await creditWallet(cents);
  if (error) return { error };
  revalidatePath("/dashboard/wallet");
  return { error: "" };
}

export async function transferAction(_prev: WalletState, formData: FormData): Promise<WalletState> {
  const user = await getCurrentUser();
  if (!user) return { error: "The transfer could not be sent." };

  const recipient = String(formData.get("recipient") ?? "");
  if (!recipient) return { error: "Choose a recipient." };

  const cents = dollarsToCents(String(formData.get("amount") ?? ""));
  if (cents === null) return { error: "Enter an amount from $0.01 to $1,000,000." };

  const error = await transferFunds(recipient, cents);
  if (error) return { error };
  revalidatePath("/dashboard/wallet");
  return { error: "" };
}

async function finishPayout(
  method: "ach" | "crypto",
  cents: number,
  hint: string,
  provider: string,
  send: (payoutId: string) => Promise<string | { providerId: string }>,
): Promise<WalletState> {
  const reserved = await reservePayout(method, cents, hint);
  if (reserved.error || !reserved.id) return { error: reserved.error || "The payout could not be sent." };
  const sent = await send(reserved.id);
  if (typeof sent === "string") {
    await releasePayout(reserved.id);
    return { error: sent };
  }
  const settled = await settlePayout(reserved.id, provider, sent.providerId);
  if (settled) return { error: settled };
  revalidatePath("/dashboard/wallet");
  revalidatePath("/dashboard");
  return { error: "" };
}

export async function connectBankAction(): Promise<string> {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") return "The payout could not be sent.";
  const started = await startBankSetup(user.email);
  if (typeof started === "string") return started;
  redirect(started.url);
}

export async function sendAchAction(_prev: WalletState, formData: FormData): Promise<WalletState> {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") return { error: "The payout could not be sent." };
  const cents = dollarsToCents(String(formData.get("amount") ?? ""));
  if (cents === null) return { error: "Enter an amount from $0.01 to $1,000,000." };
  const bank = await loadBankAccount();
  if (!bank.bankReady || !bank.stripeAccountId) return { error: "Add a bank account before an ACH payout." };
  return finishPayout("ach", cents, "ACH", "stripe", (payoutId) => sendAch(cents, bank.stripeAccountId, payoutId));
}

export async function connectBrokerAction(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) return "The payout could not be sent.";
  if (!cryptoReady()) return "Payouts are not connected yet.";
  revalidatePath("/dashboard/wallet");
  return "";
}

export async function saveCryptoWalletAction(_prev: WalletState, formData: FormData): Promise<WalletState> {
  const user = await getCurrentUser();
  if (!user) return { error: "The wallet could not be saved." };
  const address = String(formData.get("address") ?? "").trim();
  if (address && !/^[A-Za-z0-9]{20,128}$/.test(address)) return { error: "Enter a crypto address." };
  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage };
  const saved = await supabase.rpc("save_crypto_wallet", { wallet_address: address });
  if (saved.error) return { error: "The wallet could not be saved." };
  revalidatePath("/dashboard/wallet");
  return { error: "" };
}

export async function sendCryptoAction(_prev: WalletState, formData: FormData): Promise<WalletState> {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") return { error: "The payout could not be sent." };
  const asset = payoutAsset(String(formData.get("asset") ?? ""));
  if (!asset) return { error: "Choose BTC, ETH, or USDC." };
  const address = String(formData.get("address") ?? "").trim();
  if (!/^[A-Za-z0-9]{20,128}$/.test(address)) return { error: "Enter a crypto address." };
  const cents = dollarsToCents(String(formData.get("amount") ?? ""));
  if (cents === null) return { error: "Enter an amount from $0.01 to $1,000,000." };
  const hint = `${asset} ${address.slice(0, 4)}…${address.slice(-4)}`;
  return finishPayout("crypto", cents, hint, "coinbase", () => sendCrypto(cents, asset, address));
}
