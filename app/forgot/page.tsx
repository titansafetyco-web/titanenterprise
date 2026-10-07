import type { Metadata } from "next";
import { ForgotForm } from "@/components/forgot-form";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).forgotPassword} · ${site.name}` };
}

export default async function ForgotPage() {
  const t = ui(await getLocale());

  return (
    <>
      <SiteHeader />
      <main className="bg-canvas">
        <div className="mx-auto max-w-md px-6 py-16 md:py-24">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            {t.account}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide">
            {t.resetTitle}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">{t.forgotLead}</p>
          <ForgotForm />
        </div>
      </main>
      <Footer name={site.name} />
    </>
  );
}
