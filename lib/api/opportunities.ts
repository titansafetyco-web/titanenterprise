import { mockOpportunities, mockOpportunity } from "@/data/mockOpportunities";
import type { Locale } from "@/lib/i18n/locale";

export async function listOpportunities(locale: Locale) {
  return { items: mockOpportunities(locale), error: "" };
}

export async function getOpportunity(locale: Locale, id: string) {
  const item = mockOpportunity(locale, id);
  if (!item) return { item: null, error: "" };
  return { item, error: "" };
}
