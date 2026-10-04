import type { Metadata } from "next";
import Image from "next/image";
import { AffiliateForm } from "@/components/affiliate-form";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { programLabel } from "@/lib/i18n/catalog";
import { getLocale } from "@/lib/i18n/locale";
import { affiliateCopy } from "@/lib/i18n/pages";
import { ui } from "@/lib/i18n/ui";
import { listPrograms } from "@/lib/programs";

export async function generateMetadata(): Promise<Metadata> {
  const copy = affiliateCopy(await getLocale());
  return {
    title: `${copy.eyebrow} · Titan Safety Co.`,
    description: copy.purposeBody,
  };
}

export default async function AffiliatePage() {
  const locale = await getLocale();
  const copy = affiliateCopy(locale);
  const t = ui(locale);
  const programs = (await listPrograms()).map((program) => ({
    id: program.id,
    name: programLabel(locale, program),
  }));
  const { lines, sequenceItems: sequence, standardsItems: standards, tools } = copy;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative isolate min-h-[28rem] overflow-hidden bg-ink text-white md:min-h-[34rem]">
          <Image
            src="/affiliate-hero.jpg"
            alt={copy.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[70%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/88 to-ink/20" />
          <div className="relative mx-auto flex min-h-[28rem] max-w-6xl flex-col items-start justify-end gap-8 px-6 py-16 sm:flex-row sm:items-end sm:justify-between md:min-h-[34rem] md:py-20">
            <div className="max-w-3xl border-l-4 border-accent pl-6">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
                {copy.eyebrow}
              </p>
              <h1 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight md:text-6xl">
                {copy.title}
              </h1>
            </div>
            <a
              href="#onboarding"
              className="inline-block shrink-0 bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-[#e0b400] sm:mb-1"
            >
              {t.applyNow}
            </a>
          </div>
        </section>

        <section className="border-b border-line bg-white" aria-label={copy.linesLabel}>
          <ul className="mx-auto grid max-w-6xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {lines.map((line) => (
              <li
                key={line}
                className="border-b border-line px-6 py-4 font-display text-xs font-semibold uppercase tracking-[0.14em] text-ink last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0"
              >
                {line}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white">
          <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 py-12 md:grid-cols-12 md:py-20">
            <div className="space-y-5 md:col-span-7">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {copy.purpose}
              </p>
              <p className="text-xl leading-snug md:text-2xl">
                {copy.purposeLead}
              </p>
              <p className="text-lg leading-relaxed text-muted">
                {copy.purposeBody}
              </p>
            </div>
            <aside className="border border-line bg-canvas px-6 py-6 md:col-span-5 md:px-8 md:py-8">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {copy.insurance}
              </p>
              <p className="mt-4 leading-relaxed">{copy.insuranceBody}</p>
            </aside>
          </div>
        </section>

        <section className="border-y border-line bg-canvas">
          <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {copy.sequence}
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold uppercase tracking-wide">
              {copy.sequenceTitle}
            </h2>
            <ol className="mt-8 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
              {sequence.map((step) => (
                <li key={step.title} className="bg-white px-5 py-6">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
            <p className="max-w-3xl border-l-4 border-accent pl-6 text-lg leading-relaxed">
              {copy.commission}
            </p>
          </div>
        </section>

        <section className="bg-ink text-white">
          <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {copy.standards}
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold uppercase tracking-wide">
              {copy.standardsTitle}
            </h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {standards.map((item) => (
                <li key={item.title} className="border border-white/15 px-5 py-5">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-accent">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/75">{item.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {copy.technology}
            </p>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed">
              {copy.technologyBody}
            </p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {tools.map((tool) => (
                <li
                  key={tool}
                  className="border border-line px-3 py-2 font-display text-xs font-semibold uppercase tracking-[0.14em]"
                >
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t-4 border-accent bg-ink text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-end md:justify-between md:py-16">
            <p className="max-w-3xl font-display text-2xl font-bold uppercase leading-snug tracking-wide md:text-3xl">
              {copy.closer}
            </p>
            <a
              href="#onboarding"
              className="inline-block shrink-0 bg-accent px-5 py-3 text-center font-display text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-[#e0b400]"
            >
              {t.yourExperience}
            </a>
          </div>
        </section>

        <section id="onboarding" className="bg-canvas">
          <div className="mx-auto grid max-w-6xl items-start gap-8 px-6 py-12 lg:grid-cols-12 lg:py-20">
            <div className="lg:col-span-4">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {t.onboarding}
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-wide">
                {t.yourExperience}
              </h2>
            </div>
            <div className="border border-line bg-white px-5 py-6 sm:px-8 sm:py-8 lg:col-span-8">
              <AffiliateForm programs={programs} />
            </div>
          </div>
        </section>
      </main>
      <Footer name="Titan Safety Co." />
    </>
  );
}
