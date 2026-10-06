import { WorkCarousel } from "@/components/work-carousel";
import { catalog } from "@/lib/i18n/catalog";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export async function Offerings() {
  const t = ui(await getLocale());
  const { offerings } = catalog(await getLocale());

  return (
    <section id="work" className="bg-canvas overflow-visible">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-4 md:pt-24 md:pb-8">
        <div className="overflow-hidden border border-line bg-white">
          <div className="grid gap-6 border-l-8 border-accent px-6 py-8 md:grid-cols-12 md:items-center md:px-10 md:py-10">
            <h2 className="font-display text-4xl font-bold uppercase tracking-wide md:col-span-4 md:text-5xl">
              <span className="flex items-center gap-4">
                <WorkIcon />
                {t.work}
              </span>
            </h2>
            <p className="text-lg leading-relaxed md:col-span-8">
              {t.workIntro}
            </p>
          </div>
        </div>
        <WorkCarousel
          items={offerings.map((offering) => ({ ...offering, id: offeringId(offering.title) }))}
          learnMore={t.learnMore}
          showLess={t.showLess}
          previousLabel={t.activityPrevious}
          nextLabel={t.activityNext}
          tabsLabel={t.work}
        />
      </div>
    </section>
  );
}

function offeringId(title: string) {
  return `work-${title.toLowerCase().replaceAll(" ", "-")}`;
}

function WorkIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-10 w-10 text-accent" aria-hidden="true">
      <rect x="3" y="3" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="18" y="3" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="18" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="18" y="18" width="11" height="11" fill="currentColor" />
    </svg>
  );
}
