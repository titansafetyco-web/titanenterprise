import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getOpportunity } from "@/lib/api/opportunities";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { site } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const { item } = await getOpportunity(locale, id);
  return { title: item ? `${item.title} · ${site.name}` : site.name };
}

export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const t = ui(locale);
  const [{ item }, account] = await Promise.all([getOpportunity(locale, id), getCurrentUser()]);
  if (!item) notFound();

  const sections = [
    { title: t.whatQualifies, items: item.qualifies },
    { title: t.whatDoesNot, items: item.doesNotQualify },
    { title: t.requirements, items: item.requirements },
    { title: t.steps, items: item.steps },
    { title: t.documentation, items: item.documents },
  ];

  return (
    <>
      <SiteHeader />
      <main className="bg-canvas">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-8 md:gap-8 md:px-6 md:py-12 lg:grid-cols-12 lg:py-16">
          <aside className="order-first h-fit border border-line bg-white p-4 md:p-6 lg:order-none lg:sticky lg:top-24 lg:col-span-4">
            <div className="rounded-sm border border-accent/30 bg-[#fff7cc] px-3 py-3 md:px-4 md:py-4">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-[#7a5b00]">{item.compensationLabel}</p>
              <p className="mt-1 font-display text-2xl font-bold md:text-3xl">{item.compensationAmount}</p>
              <p className="mt-1 text-sm text-[#7a5b00]">{item.compensationType}</p>
            </div>
            <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-sm border border-line bg-canvas px-3 py-2.5">
                <dt className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t.payout}</dt>
                <dd className="mt-1 font-display text-sm font-semibold">{item.payoutSchedule}</dd>
              </div>
              <div className="rounded-sm border border-line bg-canvas px-3 py-2.5">
                <dt className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t.verification}</dt>
                <dd className="mt-1 font-display text-sm font-semibold">{item.verificationTime}</dd>
              </div>
              <div className="rounded-sm border border-line bg-canvas px-3 py-2.5">
                <dt className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t.level}</dt>
                <dd className="mt-1 font-display text-sm font-semibold">{item.difficulty}</dd>
              </div>
              <div className="rounded-sm border border-line bg-canvas px-3 py-2.5">
                <dt className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t.remote}</dt>
                <dd className="mt-1 font-display text-sm font-semibold">{item.remote ? t.yes : t.no}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-muted">{t.compDisclaimer}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted">{t.footerDisclaimer}</p>
            <Link href="/payout-policy" className="mt-4 inline-flex min-h-11 items-center font-display text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              {t.viewPayoutPolicy}
            </Link>
            <Link
              href={account ? "/jobs" : "/signup?next=/jobs"}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center bg-accent px-4 font-display text-xs font-semibold uppercase tracking-[0.14em] text-ink hover:bg-[#e0b400]"
            >
              {account ? t.jobMarketplace : t.createAccountContinue}
            </Link>
          </aside>

          <article className="lg:col-span-8">
            <div className="border border-line bg-white p-4 md:p-6">
              <p className="inline-flex border border-line bg-canvas px-2 py-1 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                {item.category}
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold uppercase tracking-wide md:text-5xl">{item.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:mt-4 md:text-lg">{item.description}</p>
            </div>
            <div className="mt-4 grid gap-3 md:mt-6 md:gap-4">
              {sections.map((section) => (
                <section key={section.title} className="border border-line bg-white p-4 md:p-5">
                  <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">{section.title}</h2>
                  <ul className="mt-3 space-y-2">
                    {section.items.map((line) => (
                      <li key={line} className="flex gap-2 text-sm leading-relaxed">
                        <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
              <section className="border border-line bg-white p-4 md:p-5">
                <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">{t.verificationProcess}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.verification}</p>
              </section>
              <section className="border border-line bg-white p-4 md:p-5">
                <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">{t.reversal}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.reversal}</p>
              </section>
            </div>
          </article>
        </div>
      </main>
      <Footer name={site.name} />
    </>
  );
}
