import { catalog } from "@/lib/i18n/catalog";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export async function Standards() {
  const t = ui(await getLocale());
  const { standards } = catalog(await getLocale());

  return (
    <section id="standards" className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-6 py-8 md:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">
            {t.standardsLink}
            <span
              className="mt-2 block h-1 w-12 bg-accent md:mt-3"
              aria-hidden="true"
            />
          </h2>
          <p className="mt-3 text-sm leading-snug text-white/75 md:mt-6 md:text-lg md:leading-relaxed">
            {t.standardsIntro}
          </p>
        </div>
        <ol className="mt-5 grid gap-2 md:mt-10 md:grid-cols-3 md:gap-4">
          {standards.map((item) => (
            <li
              key={item.title}
              className="border-l-4 border-accent bg-white px-4 py-4 text-foreground md:px-6 md:py-8"
            >
              <h3 className="font-display text-lg font-bold uppercase tracking-wide md:text-2xl">
                {item.title}
              </h3>
              <p className="mt-1 text-sm leading-snug text-muted md:mt-4 md:text-base md:leading-relaxed">
                {item.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
