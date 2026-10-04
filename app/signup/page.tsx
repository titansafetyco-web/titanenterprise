import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).createAccount} · Titan Safety Co.` };
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const requested = safeNext((await searchParams).next);
  const next = requested === "/" ? "/dashboard" : requested;
  if (await getCurrentUser()) redirect(next);
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
            {t.createAccount}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {t.pendingApproval}
          </p>
          <AuthForm mode="signup" next={next} />
        </div>
      </main>
      <Footer name="Titan Safety Co." />
    </>
  );
}
