import Link from "next/link";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { site } from "@/lib/site";

export default async function OpportunityMissing() {
  const t = ui(await getLocale());

  return (
    <>
      <SiteHeader />
      <main className="bg-canvas">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="max-w-xl text-lg leading-relaxed">{t.noOpportunity}</p>
          <Link
            href="/#opportunities"
            className="mt-6 inline-flex min-h-11 items-center bg-accent px-4 font-display text-xs font-semibold uppercase tracking-[0.14em] text-ink"
          >
            {t.exploreOpportunities}
          </Link>
        </div>
      </main>
      <Footer name={site.name} />
    </>
  );
}
