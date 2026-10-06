import { HowRoadmap } from "@/components/how-roadmap";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export async function HowTitanWorks() {
  const t = ui(await getLocale());
  const items = [
    { id: "browse", title: t.howBrowse, text: t.howBrowseText },
    { id: "accept", title: t.howAccept, text: t.howAcceptText },
    { id: "complete", title: t.howComplete, text: t.howCompleteText },
    { id: "verify", title: t.howVerify, text: t.howVerifyText },
    { id: "paid", title: t.howPaid, text: t.howPaidText },
  ];

  return (
    <section id="how" className="border-b border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-16">
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-accent md:text-xs md:tracking-[0.18em]">
          {t.howKicker}
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-wide md:mt-3 md:text-4xl">{t.howTitle}</h2>
        <HowRoadmap
          items={items}
          detailLabel={t.details}
          nextStepLabel={t.nextStep}
          learnMoreLabel={t.learnMore}
        />
      </div>
    </section>
  );
}
