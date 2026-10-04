import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const notConnected = "Payouts are not connected yet.";
const payoutFail = "The payout could not be sent.";
const tooSmall = "That amount is too small to send as this asset.";

export type PayoutAsset = "BTC" | "ETH" | "USDC";

export function payoutAsset(value: string): PayoutAsset | null {
  if (value === "BTC" || value === "ETH" || value === "USDC") return value;
  return null;
}

export function achReady() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function cryptoReady() {
  return Boolean(
    process.env.COINBASE_API_KEY && process.env.COINBASE_API_SECRET && process.env.COINBASE_API_PASSPHRASE,
  );
}

export async function requestOrigin() {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host") ?? "localhost:3000";
  const proto = incoming.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function stripe(path: string, fields?: Record<string, string>, account?: string, idempotency?: string) {
  const key = process.env.STRIPE_SECRET_KEY || "";
  if (!key) return null;
  const requestHeaders: Record<string, string> = { Authorization: `Bearer ${key}` };
  if (account) requestHeaders["Stripe-Account"] = account;
  if (idempotency) requestHeaders["Idempotency-Key"] = idempotency;
  const init: RequestInit = { headers: requestHeaders, cache: "no-store" };
  if (fields) {
    requestHeaders["Content-Type"] = "application/x-www-form-urlencoded";
    init.method = "POST";
    init.body = new URLSearchParams(fields);
  }
  const response = await fetch(`https://api.stripe.com${path}`, init);
  const json = (await response.json().catch(() => null)) as {
    id?: string;
    url?: string;
    payouts_enabled?: boolean;
  } | null;
  if (!response.ok || !json) return null;
  return json;
}

export async function loadBankAccount() {
  const supabase = await createClient();
  if (!supabase) return { stripeAccountId: "", bankReady: false };
  const { data } = await supabase
    .from("payout_accounts")
    .select("stripe_account_id, bank_ready")
    .maybeSingle();
  return {
    stripeAccountId: data?.stripe_account_id ?? "",
    bankReady: Boolean(data?.bank_ready),
  };
}

export async function refreshBankAccount() {
  const current = await loadBankAccount();
  if (!current.stripeAccountId || !achReady()) return current.bankReady;
  const account = await stripe(`/v1/accounts/${current.stripeAccountId}`);
  const ready = Boolean(account?.payouts_enabled);
  const supabase = await createClient();
  if (!supabase) return ready;
  await supabase.rpc("save_payout_account", { stripe_id: current.stripeAccountId, ready });
  return ready;
}

export async function startBankSetup(email: string) {
  if (!achReady()) return notConnected;
  const supabase = await createClient();
  if (!supabase) return payoutFail;
  const current = await loadBankAccount();
  let accountId = current.stripeAccountId;
  if (!accountId) {
    const created = await stripe("/v1/accounts", {
      type: "express",
      country: "US",
      email,
      "capabilities[transfers][requested]": "true",
    });
    if (!created?.id?.startsWith("acct_")) return payoutFail;
    accountId = created.id;
    const saved = await supabase.rpc("save_payout_account", { stripe_id: accountId, ready: false });
    if (saved.error) return payoutFail;
  }
  const origin = await requestOrigin();
  const link = await stripe("/v1/account_links", {
    account: accountId,
    refresh_url: `${origin}/dashboard/wallet?stripe=refresh`,
    return_url: `${origin}/dashboard/wallet?stripe=return`,
    type: "account_onboarding",
  });
  if (!link?.url) return payoutFail;
  return { url: link.url };
}

export async function sendAch(cents: number, accountId: string, payoutId: string) {
  if (!achReady()) return notConnected;
  const transfer = await stripe(
    "/v1/transfers",
    { amount: String(cents), currency: "usd", destination: accountId },
    undefined,
    `${payoutId}-transfer`,
  );
  if (!transfer?.id) return payoutFail;
  const payout = await stripe(
    "/v1/payouts",
    { amount: String(cents), currency: "usd" },
    accountId,
    `${payoutId}-payout`,
  );
  return { providerId: payout?.id || transfer.id };
}

function coinbaseSign(secret: string, timestamp: string, method: string, path: string, body: string) {
  return createHmac("sha256", Buffer.from(secret, "base64"))
    .update(`${timestamp}${method}${path}${body}`)
    .digest("base64");
}

async function coinbasePrice(asset: "BTC" | "ETH") {
  const response = await fetch(`https://api.exchange.coinbase.com/products/${asset}-USD/ticker`, {
    cache: "no-store",
  });
  const json = (await response.json().catch(() => null)) as { price?: string } | null;
  const price = Number(json?.price);
  if (!response.ok || !Number.isFinite(price) || price <= 0) return null;
  return price;
}

function assetAmount(cents: number, price: number, places: number) {
  const factor = 10 ** places;
  const units = Math.floor((cents / 100 / price) * factor) / factor;
  if (units <= 0) return "";
  return units.toFixed(places);
}

export type CryptoHolding = {
  asset: PayoutAsset;
  amount: string;
};

const cryptoAssets: PayoutAsset[] = ["BTC", "ETH", "USDC"];

function coinbaseHeaders(method: string, path: string, body: string) {
  const timestamp = String(Math.floor(Date.now() / 1000));
  return {
    "CB-ACCESS-KEY": process.env.COINBASE_API_KEY || "",
    "CB-ACCESS-SIGN": coinbaseSign(process.env.COINBASE_API_SECRET || "", timestamp, method, path, body),
    "CB-ACCESS-TIMESTAMP": timestamp,
    "CB-ACCESS-PASSPHRASE": process.env.COINBASE_API_PASSPHRASE || "",
  };
}

export async function loadCryptoHoldings() {
  const holdings: CryptoHolding[] = cryptoAssets.map((asset) => ({ asset, amount: "" }));
  if (!cryptoReady()) return { connected: false, holdings };
  const path = "/accounts";
  const response = await fetch(`https://api.exchange.coinbase.com${path}`, {
    cache: "no-store",
    headers: coinbaseHeaders("GET", path, ""),
  });
  const rows = (await response.json().catch(() => null)) as { currency?: string; available?: string }[] | null;
  if (!response.ok || !Array.isArray(rows)) return { connected: false, holdings };
  return {
    connected: true,
    holdings: cryptoAssets.map((asset) => {
      const row = rows.find((item) => item.currency === asset);
      const amount = Number(row?.available ?? "0");
      return { asset, amount: Number.isFinite(amount) ? amount.toString() : "0" };
    }),
  };
}

export async function loadCryptoWallet() {
  const supabase = await createClient();
  if (!supabase) return "";
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return "";
  const { data } = await supabase.from("crypto_wallets").select("address").eq("user_id", auth.user.id).maybeSingle();
  return data?.address ?? "";
}

export async function sendCrypto(cents: number, asset: PayoutAsset, address: string) {
  if (!cryptoReady()) return notConnected;
  const price = asset === "USDC" ? 1 : await coinbasePrice(asset);
  if (!price) return payoutFail;
  const amount = assetAmount(cents, price, asset === "USDC" ? 2 : 8);
  if (!amount) return tooSmall;
  const path = "/withdrawals/crypto";
  const body = JSON.stringify({
    amount,
    currency: asset,
    crypto_address: address,
    network: asset === "BTC" ? "bitcoin" : "ethereum",
  });
  const response = await fetch(`https://api.exchange.coinbase.com${path}`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...coinbaseHeaders("POST", path, body),
    },
    body,
  });
  const json = (await response.json().catch(() => null)) as { id?: string } | null;
  if (!response.ok || !json?.id) return payoutFail;
  return { providerId: json.id };
}
