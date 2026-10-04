import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";

export function LegalPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="bg-canvas">
        <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">
            {title}
          </h1>
          <div className="mt-12 space-y-10">{children}</div>
        </article>
      </main>
      <Footer name={site.name} />
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
        {title}
        <span className="mt-3 block h-1 w-12 bg-accent" aria-hidden="true" />
      </h2>
      <div className="mt-5 space-y-4 leading-relaxed text-foreground">{children}</div>
    </section>
  );
}
