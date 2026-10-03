import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sign in · Titan Safety Co.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next);
  if (await getCurrentUser()) redirect(next);

  return (
    <>
      <SiteHeader />
      <main className="bg-canvas">
        <div className="mx-auto max-w-md px-6 py-16 md:py-24">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            Account
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide">
            Sign in
          </h1>
          <AuthForm mode="login" next={next} />
        </div>
      </main>
      <Footer name={site.name} />
    </>
  );
}
