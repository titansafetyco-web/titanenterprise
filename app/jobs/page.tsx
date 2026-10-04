import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JobMarket } from "@/components/job-market";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { listChosenJobs, listJobs } from "@/lib/jobs";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).jobMarketplace} · Titan Safety Co.` };
}

export default async function JobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/jobs");

  const t = ui(await getLocale());
  const jobs = await listJobs();
  const chosen = await listChosenJobs();

  return (
    <>
      <SiteHeader />
      <main className="bg-canvas">
        <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            {t.account}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">
            {t.jobMarketplace}
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">{t.jobMarketplaceLead}</p>
          <JobMarket
            jobs={jobs.items}
            chosen={chosen.items.map((job) => job.id)}
            admin={user.role === "admin"}
            error={jobs.error}
          />
        </div>
      </main>
      <Footer name="Titan Safety Co." />
    </>
  );
}
