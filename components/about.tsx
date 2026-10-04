import Link from "next/link";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export async function About() {
  const t = ui(await getLocale());

  return (
    <section id="about" className="bg-[#1a2128] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <div className="flex flex-col gap-6 border-l-8 border-accent pl-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
              {t.about}
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold uppercase tracking-wide">
              {t.companyBio}
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-white/75">
              {t.aboutLine}
            </p>
          </div>
          <Link
            href="/about"
            className="inline-flex w-fit shrink-0 bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-[#e0b400]"
          >
            {t.readBio}
          </Link>
        </div>
        <ul className="mt-8 grid border border-white/10 sm:grid-cols-5">
          {t.practices.map((practice, index) => (
            <li
              key={practice}
              className={`px-4 py-3 font-display text-xs font-semibold uppercase tracking-wider ${
                index > 0 ? "border-t border-white/10 sm:border-t-0 sm:border-l" : ""
              }`}
            >
              {practice}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
