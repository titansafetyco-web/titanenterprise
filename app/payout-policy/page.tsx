import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { getLocale } from "@/lib/i18n/locale";
import { payoutCopy } from "@/lib/i18n/legal";

export async function generateMetadata(): Promise<Metadata> {
  const copy = payoutCopy(await getLocale());
  return {
    title: `${copy.title} · Titan Safety Co.`,
    description: copy.sections[1]?.blocks.find((block) => typeof block === "string") ?? copy.title,
  };
}

export default async function PayoutPolicyPage() {
  return <LegalDocument doc={payoutCopy(await getLocale())} />;
}
