import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JobMarket } from "@/components/job-market";
import { Footer } from "@/components/footer";
import { JobsBackLink } from "@/components/jobs-back-link";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { listChosenJobs, listJobs } from "@/lib/jobs";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).jobMarketplace} · ${site.name}` };
}

export default async function JobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/jobs");

  const locale = await getLocale();
  const t = ui(locale);
  const jobs = await listJobs();
  const chosen = await listChosenJobs();

  return (
    <>
      <SiteHeader />
      <main className="bg-canvas">
        <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
          <div className="-mt-3 mb-6">
            <JobsBackLink locale={locale} />
          </div>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            {t.account}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">
            {t.jobMarketplace}
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">
            {locale === "es" ? "Elija trabajos de la lista. Los que seleccione permanecen en " : "Choose jobs from the list. The ones you select stay in "}
            <a href="/dashboard/jobs" className="text-accent underline underline-offset-2 hover:text-[#e0b400]">
              {locale === "es" ? "Trabajos" : "Jobs"}
            </a>
            . {t.jobPenaltyNote}
          </p>
          <JobMarket
            jobs={jobs.items}
            chosen={chosen.items.map((job) => job.id)}
            admin={user.role === "admin"}
            error={jobs.error}
          />
        </div>
      </main>
      <Footer name={site.name} />
    </>
  );
}
