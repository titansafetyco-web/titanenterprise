import { catalog } from "@/lib/i18n/catalog";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export async function Standards() {
  const t = ui(await getLocale());
  const { standards } = catalog(await getLocale());

  return (
    <section id="standards" className="bg-ink text-white">
      <div className="relative mx-auto max-w-6xl px-6 py-8 md:py-20">
        <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-2 bg-accent" />
        <div className="max-w-3xl border border-white/20 bg-white/5 px-5 py-5 md:px-7 md:py-7">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {t.standardsLink}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">
            {t.standardsIntro}
          </h2>
          <span className="mt-4 block h-1 w-14 bg-accent" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
