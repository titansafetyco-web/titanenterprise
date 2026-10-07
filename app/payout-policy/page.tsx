import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { getLocale } from "@/lib/i18n/locale";
import { payoutCopy } from "@/lib/i18n/legal";
import { ui } from "@/lib/i18n/ui";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const copy = payoutCopy(await getLocale());
  return {
    title: `${copy.title} · ${site.name}`,
    description: copy.sections[1]?.blocks.find((block) => typeof block === "string") ?? copy.title,
  };
}

export default async function PayoutPolicyPage() {
  const locale = await getLocale();
  return <LegalDocument doc={payoutCopy(locale)} note={ui(locale).footerDisclaimer} />;
}
