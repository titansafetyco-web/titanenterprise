import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { rememberEmailCookie, rememberedEmail } from "@/lib/supabase/remember";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).signIn} · ${site.name}` };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const requested = safeNext((await searchParams).next);
  const next = requested === "/" ? "/dashboard" : requested;
  if (await getCurrentUser()) redirect(next);
  const t = ui(await getLocale());
  const remembered = rememberedEmail((await cookies()).get(rememberEmailCookie)?.value);

  return (
    <>
      <SiteHeader />
      <main className="bg-canvas">
        <div className="mx-auto max-w-md px-6 py-16 md:py-24">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            {t.account}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide">
            {t.signIn}
          </h1>
          <AuthForm mode="login" next={next} rememberedEmail={remembered} />
        </div>
      </main>
      <Footer name={site.name} />
    </>
  );
}
