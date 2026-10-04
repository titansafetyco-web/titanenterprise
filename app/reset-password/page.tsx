import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ResetForm } from "@/components/reset-form";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).resetTitle} · Titan Safety Co.` };
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const invalid = (await searchParams).error === "invalid";
  const user = invalid ? null : await getCurrentUser();
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
          {user ? (
            <>
              <p className="mt-4 text-sm leading-relaxed text-muted">{t.resetLead}</p>
              <ResetForm />
            </>
          ) : (
            <>
              <p className="mt-4 text-sm leading-relaxed text-muted">{t.resetInvalid}</p>
              <p className="mt-8 text-sm text-muted">
                <Link href="/forgot" className="text-foreground underline">
                  {t.forgotPassword}
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
      <Footer name="Titan Safety Co." />
    </>
  );
}
