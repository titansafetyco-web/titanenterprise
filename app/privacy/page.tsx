import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { getLocale } from "@/lib/i18n/locale";
import { privacyCopy } from "@/lib/i18n/legal";

export async function generateMetadata(): Promise<Metadata> {
  const copy = privacyCopy(await getLocale());
  return {
    title: `${copy.title} · Titan Safety Co.`,
    description: copy.sections[0]?.blocks.find((block) => typeof block === "string") ?? copy.title,
  };
}

export default async function PrivacyPage() {
  return <LegalDocument doc={privacyCopy(await getLocale())} />;
}
