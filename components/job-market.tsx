"use client";

import { removeJobAction, selectJobAction } from "@/app/jobs/actions";
import { JobFacts } from "@/components/job-facts";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";
import type { Job } from "@/lib/jobs";

export function JobMarket({
  jobs,
  chosen,
  admin,
  error,
}: {
  jobs: readonly Job[];
  chosen: readonly string[];
  admin: boolean;
  error: string;
}) {
  const locale = useLocale();
  const t = ui(locale);
  const pickedIds = new Set(chosen);

  return (
    <div className="mt-10">
      <section className="bg-white">
        <div className="border-b border-line px-6 py-5">
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
            {t.jobMarketplace}
          </h2>
        </div>
        {error ? (
          <p className="px-6 py-8 text-muted">{localizeError(locale, error)}</p>
        ) : jobs.length === 0 ? (
          <p className="px-6 py-8 text-muted">{t.noJobs}</p>
        ) : (
          <ul className="grid gap-3 bg-[#f5efe2] p-3 md:grid-cols-2 md:gap-4 md:p-4 xl:grid-cols-3">
            {jobs.map((job) => {
              const picked = pickedIds.has(job.id);
              return (
                <li key={job.id} className="border border-[#d9c79a] bg-[#fffdf8] p-3 shadow-sm md:p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#eadfbe] pb-2.5">
                    <div className="min-w-0 max-w-3xl">
                      <p className="font-display text-base font-semibold uppercase tracking-wide md:text-lg">
                        {job.title}
                      </p>
                      <p className="mt-1 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                        {t.jobMarketplace}
                      </p>
                    </div>
                    <div className="inline-flex min-h-8 items-center border border-[#eadfbe] bg-[#fff4d6] px-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a5b00]">
                      {picked ? t.selectedJob : t.selectJob}
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <div className="min-w-0">
                      <JobFacts job={job} locale={locale} />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {picked ? (
                        <p className="inline-flex min-h-9 items-center border border-[#eadfbe] bg-[#fff4d6] px-3 text-center font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a5b00]">
                          {t.selectedJob}
                        </p>
                      ) : (
                        <form action={selectJobAction}>
                          <input type="hidden" name="id" value={job.id} />
                          <button
                            type="submit"
                            className="inline-flex min-h-9 items-center bg-accent px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-ink hover:bg-[#e0b400]"
                          >
                            {t.selectJob}
                          </button>
                        </form>
                      )}
                      {admin ? (
                        <form action={removeJobAction}>
                          <input type="hidden" name="id" value={job.id} />
                          <button
                            type="submit"
                            className="inline-flex min-h-9 items-center border border-ink px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-ink hover:bg-ink hover:text-white"
                          >
                            {t.remove}
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
