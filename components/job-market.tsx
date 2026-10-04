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
          <ul>
            {jobs.map((job) => {
              const picked = pickedIds.has(job.id);
              return (
                <li key={job.id} className="border-b border-line px-6 py-5 last:border-0">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 max-w-3xl">
                      <p className="font-display text-lg font-semibold uppercase tracking-wide">
                        {job.title}
                      </p>
                      <JobFacts job={job} locale={locale} />
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      {picked ? (
                        <p className="px-5 py-3 text-center font-display text-sm font-semibold uppercase tracking-wider text-muted">
                          {t.selectedJob}
                        </p>
                      ) : (
                        <form action={selectJobAction}>
                          <input type="hidden" name="id" value={job.id} />
                          <button
                            type="submit"
                            className="bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400]"
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
                            className="border border-ink px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-ink hover:text-white"
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
