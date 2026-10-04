"use client";

import { setJobProgressAction, unselectJobAction } from "@/app/jobs/actions";
import { JobFacts } from "@/components/job-facts";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";
import type { ChosenJob } from "@/lib/jobs";

export function ChosenJobs({ jobs, error }: { jobs: readonly ChosenJob[]; error: string }) {
  const locale = useLocale();
  const t = ui(locale);
  const statusLabel = {
    processing: t.jobProcessing,
    done: t.jobDone,
    incomplete: t.jobIncomplete,
  };

  return (
    <section className="bg-white">
      <div className="border-b border-line px-6 py-5">
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide">{t.yourJobs}</h2>
      </div>
      {error ? (
        <p className="px-6 py-8 text-muted">{localizeError(locale, error)}</p>
      ) : jobs.length === 0 ? (
        <p className="px-6 py-8 text-muted">{t.noChosenJobs}</p>
      ) : (
        <ul>
          {jobs.map((job) => (
            <li key={job.id} className="border-b border-line px-6 py-5 last:border-0">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 max-w-3xl">
                  <p className="font-display text-lg font-semibold uppercase tracking-wide">
                    {job.title}
                  </p>
                  <JobFacts job={job} locale={locale} />
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <form action={setJobProgressAction}>
                    <input type="hidden" name="id" value={job.id} />
                    <label className="block">
                      <span className="sr-only">{t.jobProgressLabel}</span>
                      <select
                        name="status"
                        defaultValue={job.status}
                        onChange={(event) => event.currentTarget.form?.requestSubmit()}
                        className="border border-line bg-white px-3 py-3 font-display text-sm font-semibold uppercase tracking-wider text-foreground outline-none focus-visible:border-accent"
                      >
                        {(Object.keys(statusLabel) as (keyof typeof statusLabel)[]).map((status) => (
                          <option key={status} value={status}>
                            {statusLabel[status]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </form>
                  <form action={unselectJobAction}>
                    <input type="hidden" name="id" value={job.id} />
                    <button
                      type="submit"
                      className="border border-ink px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-ink hover:text-white"
                    >
                      {t.remove}
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
