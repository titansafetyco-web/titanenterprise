import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { getLocale } from "@/lib/i18n/locale";
import { policyCopy } from "@/lib/i18n/legal";

export async function generateMetadata(): Promise<Metadata> {
  const copy = policyCopy(await getLocale());
  return {
    title: `${copy.title} · Titan Safety Co.`,
    description: copy.sections[0]?.blocks.find((block) => typeof block === "string") ?? copy.title,
  };
}

export default async function AffiliatePolicyPage() {
  return <LegalDocument doc={policyCopy(await getLocale())} />;
}
