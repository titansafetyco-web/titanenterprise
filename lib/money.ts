import type { Locale } from "@/lib/i18n/locale";

export type WalletRecipient = {
  id: string;
  name: string;
  role: string;
};

export type WalletEntry = {
  id: string;
  kind: "credit" | "out" | "in";
  amountCents: number;
  otherName: string;
  createdAt: string;
};

const MAX_CENTS = 100_000_000;

export function dollarsToCents(value: string) {
  const trimmed = value.trim().replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const [whole, fraction = ""] = trimmed.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0").slice(0, 2));
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > MAX_CENTS) return null;
  return cents;
}

export function formatMoney(cents: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "es" ? "es-US" : "en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
