import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { programLabel } from "@/lib/i18n/catalog";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { listPrograms } from "@/lib/programs";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).createAccount} · ${site.name}` };
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const requested = safeNext((await searchParams).next);
  const next = requested === "/" ? "/dashboard" : requested;
  if (await getCurrentUser()) redirect(next);
  const locale = await getLocale();
  const t = ui(locale);
  const programs = (await listPrograms()).map((program) => ({
    id: program.id,
    name: programLabel(locale, program),
  }));

  return (
    <>
      <SiteHeader />
      <main className="bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            {t.account}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide">
            {t.createAccount}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            {t.pendingApproval}
          </p>
          <AuthForm mode="signup" next={next} programs={programs} />
        </div>
      </main>
      <Footer name={site.name} />
    </>
  );
}
