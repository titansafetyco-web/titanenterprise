import Image from "next/image";
import { catalog } from "@/lib/i18n/catalog";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export async function Offerings() {
  const t = ui(await getLocale());
  const { offerings } = catalog(await getLocale());

  return (
    <section id="work" className="bg-canvas">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
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
          <ul className="grid border-t border-line sm:grid-cols-5">
            {offerings.map((offering, index) => (
              <li
                key={offering.title}
                className={index > 0 ? "border-t border-line sm:border-t-0 sm:border-l" : ""}
              >
                <a
                  href={`#${offeringId(offering.title)}`}
                  className="block px-4 py-4 font-display text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-accent hover:text-ink"
                >
                  {offering.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <ol className="mt-12 space-y-6">
          {offerings.map((offering, index) => (
            <li
              id={offeringId(offering.title)}
              key={offering.title}
              className="grid overflow-hidden border border-line bg-white md:grid-cols-12"
            >
              <div
                className={`relative h-56 md:col-span-5 md:h-auto md:min-h-80 ${
                  index % 2 === 1 ? "md:order-2" : ""
                }`}
              >
                <Image
                  src={offering.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 28rem, 100vw"
                  className="object-cover"
                />
              </div>
              <div
                className={`border-t-4 border-accent px-6 py-8 md:col-span-7 md:border-t-0 md:px-10 md:py-10 ${
                  index % 2 === 1
                    ? "md:order-1 md:border-r-4"
                    : "md:border-l-4"
                }`}
              >
                <h3 className="font-display text-3xl font-bold uppercase tracking-wide">
                  {offering.title}
                </h3>
                <p className="mt-4 text-lg leading-relaxed">{offering.text}</p>
                <p className="mt-4 leading-relaxed text-muted">
                  {offering.detail}
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {offering.points.map((point) => (
                    <li key={point} className="flex gap-3 text-sm leading-relaxed">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 bg-accent"
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
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
