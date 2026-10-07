"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { removeJobAction, selectJobAction } from "@/app/jobs/actions";
import { JobFacts } from "@/components/job-facts";
import { JobLogo } from "@/components/job-logo";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";
import type { Job } from "@/lib/jobs";
import { formatMoney } from "@/lib/money";

const PAGE_SIZE = 15;

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
  const [page, setPage] = useState(1);
  const [openJobs, setOpenJobs] = useState<Record<string, boolean>>({});
  const totalPages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedJobs = useMemo(
    () => jobs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [jobs, safePage],
  );
  const qualificationLabel = (value: Job["qualification"]) =>
    value === "expert"
      ? locale === "es"
        ? "Experto"
        : "Expert"
      : value === "intermediate"
        ? locale === "es"
          ? "Intermedio"
          : "Intermediate"
        : locale === "es"
          ? "Principiante"
          : "Beginner";
  const qualificationTone = (value: Job["qualification"]) =>
    value === "expert"
      ? "border-[#cda434] bg-[#fff4d6] text-[#7a5b00]"
      : value === "intermediate"
        ? "border-[#9bb8e8] bg-[#eaf2ff] text-[#2c4d86]"
        : "border-[#c6d9c8] bg-[#eaf7eb] text-[#1d6a42]";
  const cadenceLabel = (job: Job) =>
    job.customPayDays
      ? `${locale === "es" ? "Cada" : "Every"} ${job.customPayDays} ${locale === "es" ? "días" : "days"}`
      : job.pay === "weekly"
        ? t.payWeekly
        : t.payBiweekly;
  const dateLabel = (value: string) =>
    value
      ? new Date(`${value}T12:00:00Z`).toLocaleDateString(locale === "es" ? "es-US" : "en-US", {
          dateStyle: "medium",
          timeZone: "UTC",
        })
      : "—";

  return (
    <div className="mt-10">
      <section className="bg-white">
        {error ? (
          <p className="px-6 py-8 text-muted">{localizeError(locale, error)}</p>
        ) : jobs.length === 0 ? (
          <p className="px-6 py-8 text-muted">{t.noJobs}</p>
        ) : (
          <>
          <ul className="grid gap-2.5 bg-[#f5efe2] p-2.5 md:gap-3 md:p-3">
            {pagedJobs.map((job) => {
              const picked = pickedIds.has(job.id);
              const expanded = Boolean(openJobs[job.id]);
              const payLabel = job.payCents > 0 ? formatMoney(job.payCents, locale) : "—";
              const startsLabel = dateLabel(job.startsOn);
              const expiresLabel = dateLabel(job.expiresOn);
              return (
                <li key={job.id} className="border border-[#d9c79a] bg-[#fffdf8] p-2.5 shadow-sm md:p-3">
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenJobs((current) => ({ ...current, [job.id]: !expanded }))}
                      className={`inline-flex min-h-10 w-8 shrink-0 items-center justify-center border border-[#d9c79a] bg-white text-foreground transition-colors hover:border-ink hover:bg-canvas ${expanded ? "" : "self-center"}`}
                      aria-label={expanded ? (locale === "es" ? "Ocultar detalles" : "Collapse details") : (locale === "es" ? "Ver detalles" : "Expand details")}
                      title={expanded ? (locale === "es" ? "Ocultar detalles" : "Collapse details") : (locale === "es" ? "Ver detalles" : "Expand details")}
                    >
                      <svg
                        viewBox="0 0 12 12"
                        aria-hidden="true"
                        className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`}
                      >
                        <path d="M4 2.5 8 6 4 9.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className={`flex flex-wrap items-start justify-between gap-2 ${expanded ? "border-b border-[#eadfbe] pb-2" : ""}`}>
                        <div className="min-w-0 max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <JobLogo
                              path={job.logoPath}
                              alt={locale === "es" ? "Logo de empresa" : "Company logo"}
                            />
                            <p className="font-display text-base font-semibold uppercase tracking-wide md:text-lg">
                              {job.title}
                            </p>
                            <span
                              className={`inline-flex min-h-7 items-center rounded-full border px-2.5 font-display text-[10px] font-semibold uppercase tracking-[0.14em] ${qualificationTone(job.qualification)}`}
                            >
                              {locale === "es" ? "Nivel" : "Level"}: {qualificationLabel(job.qualification)}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex min-h-6 items-center border border-[#eadfbe] bg-[#fff4d6] px-2 font-display text-[10px] font-semibold uppercase tracking-[0.11em] text-[#7a5b00]">
                              {payLabel}
                            </span>
                            <span className="inline-flex min-h-6 items-center border border-line bg-canvas px-2 font-display text-[10px] font-semibold uppercase tracking-[0.11em] text-foreground">
                              {locale === "es" ? "Inicia" : "Begins"}: {startsLabel}
                            </span>
                            <span className="inline-flex min-h-6 items-center border border-line bg-canvas px-2 font-display text-[10px] font-semibold uppercase tracking-[0.11em] text-foreground">
                              {locale === "es" ? "Vence" : "Expires"}: {expiresLabel}
                            </span>
                          </div>
                          <p className="mt-1 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                            {t.jobMarketplace} · {cadenceLabel(job)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {picked ? (
                            <div className="inline-flex min-h-8 items-center border border-[#eadfbe] bg-[#fff4d6] px-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a5b00]">
                              {t.selectedJob}
                            </div>
                          ) : (
                            <form action={selectJobAction}>
                              <input type="hidden" name="id" value={job.id} />
                              <button
                                type="submit"
                                className="inline-flex min-h-8 items-center border border-[#eadfbe] bg-[#fff4d6] px-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a5b00] transition-colors hover:border-[#cda434] hover:bg-[#ffe7a3]"
                              >
                                {t.selectJob}
                              </button>
                            </form>
                          )}
                        </div>
                      </div>

                      {expanded ? (
                        <>
                          <div className="mt-2">
                            <div className="min-w-0">
                              <JobFacts job={job} locale={locale} />
                            </div>
                          </div>

                          {admin ? (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <div className="flex shrink-0 flex-wrap gap-2">
                                <div className="inline-flex items-center gap-2">
                                  <Link
                                    href={`/dashboard/listing?job=${encodeURIComponent(job.id)}`}
                                    className="inline-flex min-h-9 min-w-9 items-center justify-center border border-line bg-white text-foreground transition-colors hover:border-ink hover:bg-canvas"
                                    aria-label={locale === "es" ? "Editar trabajo" : "Edit job"}
                                    title={locale === "es" ? "Editar trabajo" : "Edit job"}
                                  >
                                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                                      <path d="M4 13.5V16h2.5L15 7.5 12.5 5 4 13.5Z" />
                                      <path d="m11.5 6 2.5 2.5" />
                                    </svg>
                                  </Link>
                                  <form action={removeJobAction}>
                                    <input type="hidden" name="id" value={job.id} />
                                    <button
                                      type="submit"
                                      className="inline-flex min-h-9 min-w-9 items-center justify-center border border-ink bg-white text-ink transition-colors hover:bg-ink hover:text-white"
                                      aria-label={t.remove}
                                      title={t.remove}
                                    >
                                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                                        <path d="M4.5 6h11" />
                                        <path d="M8 6V4.8h4V6" />
                                        <path d="m6.5 6 .8 9h5.4l.8-9" />
                                      </svg>
                                    </button>
                                  </form>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {totalPages > 1 ? (
            <div className="border-t border-line bg-white px-3 py-3 md:px-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-[0.12em] text-muted">
                  {locale === "es" ? "Página" : "Page"} {safePage} / {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    disabled={safePage === 1}
                    className="inline-flex min-h-9 items-center border border-line bg-white px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:border-ink hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {locale === "es" ? "Anterior" : "Previous"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                    disabled={safePage === totalPages}
                    className="inline-flex min-h-9 items-center border border-line bg-white px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:border-ink hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {locale === "es" ? "Siguiente" : "Next"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          </>
        )}
      </section>
    </div>
  );
}
