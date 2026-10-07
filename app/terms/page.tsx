import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { getLocale } from "@/lib/i18n/locale";
import { termsCopy } from "@/lib/i18n/legal";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const copy = termsCopy(await getLocale());
  return {
    title: `${copy.title} · ${site.name}`,
    description: copy.sections[0]?.blocks.find((block) => typeof block === "string") ?? copy.title,
  };
}

export default async function TermsPage() {
  return <LegalDocument doc={termsCopy(await getLocale())} />;
}
