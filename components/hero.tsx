import Image from "next/image";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export async function Hero() {
  const t = ui(await getLocale());

  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <Image
        src="/hero-corporate.jpg"
        alt={t.heroAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[70%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
      <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-12">
        <div className="max-w-2xl">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            {t.heroKicker}
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-white md:text-6xl lg:text-7xl">
            {t.heroTitle}
            {t.heroLine2 ? <span className="mt-3 block">{t.heroLine2}</span> : null}
            {t.heroLine3 ? <span className="mt-3 block text-accent">{t.heroLine3}</span> : null}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
            {t.heroBody}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#opportunities"
              className="bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-white"
            >
              {t.exploreOpportunities}
            </a>
            <Link
              href="/affiliate#onboarding"
              className="border border-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-ink"
            >
              {t.becomeMember}
            </Link>
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {[t.trustVerified, t.trustCompensation, t.trustSubmissions, t.trustPayouts].map((item) => (
              <li key={item} className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
