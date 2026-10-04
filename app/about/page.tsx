import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getLocale } from "@/lib/i18n/locale";
import { aboutCopy } from "@/lib/i18n/pages";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const copy = aboutCopy(await getLocale());
  return {
    title: `${copy.eyebrow} · Titan Safety Co.`,
    description: site.description,
  };
}

export default async function AboutPage() {
  const copy = aboutCopy(await getLocale());

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
              {copy.eyebrow}
            </p>
            <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight md:text-6xl">
              {copy.hero}
            </h1>
          </div>
        </section>
        <section className="bg-white">
          <div className="mx-auto grid max-w-6xl gap-5 px-6 py-16 md:py-20">
            {copy.chapters.map((chapter) => (
              <article
                key={chapter.label}
                className="grid overflow-hidden border border-line md:grid-cols-12"
              >
                <div className="flex flex-col border-l-8 border-accent bg-ink px-8 py-8 text-white md:col-span-4 md:px-10 md:py-10">
                  <ChapterMark name={chapter.id} />
                  <h2 className="mt-6 font-display text-3xl font-bold uppercase tracking-wide">
                    {chapter.label}
                  </h2>
                  <ul className="mt-8 space-y-3 md:mt-auto md:pt-10">
                    {chapter.points.map((point) => (
                      <li key={point} className="flex gap-3 text-sm leading-relaxed text-white/75">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="px-8 py-8 text-lg leading-relaxed md:col-span-8 md:px-12 md:py-10">
                  {chapter.text}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section className="bg-canvas">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
            <p className="max-w-3xl border-l-4 border-accent pl-6 font-display text-3xl font-bold uppercase leading-snug tracking-wide md:text-4xl">
              {copy.closer}
            </p>
            <Link
              href="/#work"
              className="mt-10 inline-block bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-[#e0b400]"
            >
              {copy.work}
            </Link>
          </div>
        </section>
      </main>
      <Footer name={site.name} />
    </>
  );
}

function ChapterMark({ name }: { name: string }) {
  const props = {
    viewBox: "0 0 32 32",
    className: "h-8 w-8 text-accent",
    "aria-hidden": true as const,
  };

  if (name === "Programs") {
    return (
      <svg {...props}>
        <circle cx="8" cy="16" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="24" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="24" cy="24" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M11 14.5 21 9.2M11 17.5 21 22.8" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  if (name === "Approach") {
    return (
      <svg {...props}>
        <rect x="4" y="12" width="5" height="8" fill="currentColor" />
        <rect x="12" y="12" width="5" height="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <rect x="20" y="12" width="5" height="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 16h3M17 16h3" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  if (name === "Technology") {
    return (
      <svg {...props}>
        <rect x="9" y="9" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <rect x="13" y="13" width="6" height="6" fill="currentColor" />
        <path d="M13 4v5M19 4v5M13 23v5M19 23v5M4 13h5M4 19h5M23 13h5M23 19h5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <rect x="6" y="6" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="12" y="12" width="8" height="8" fill="currentColor" />
    </svg>
  );
}
