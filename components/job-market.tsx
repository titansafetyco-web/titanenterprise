"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { removeJobAction, selectJobAction } from "@/app/jobs/actions";
import { JobLogo } from "@/components/job-logo";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import type { Locale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import type { Job } from "@/lib/jobs";
import { formatMoney } from "@/lib/money";

const PAGE_SIZE = 15;

function categoryTone(program: Job["program"]) {
  switch (program) {
    case "energy":
      return "border-[#0f766e]/30 bg-[#ccfbf1] text-[#0f766e]";
    case "safety":
      return "border-[#a16207]/30 bg-[#fef3c7] text-[#a16207]";
    case "media":
      return "border-[#1d4ed8]/30 bg-[#dbeafe] text-[#1d4ed8]";
    case "software":
      return "border-[#7c3aed]/30 bg-[#ede9fe] text-[#7c3aed]";
    case "insurance":
      return "border-[#b91c1c]/30 bg-[#fee2e2] text-[#b91c1c]";
    default:
      return "border-line bg-canvas text-accent";
  }
}

function programLabel(job: Job, t: ReturnType<typeof ui>) {
  if (job.program === "safety") return t.jobProgramSafety;
  if (job.program === "energy") return t.jobProgramEnergy;
  if (job.program === "media") return t.jobProgramMedia;
  if (job.program === "software") return t.jobProgramSoftware;
  if (job.program === "insurance") return t.jobProgramInsurance;
  return "";
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-line bg-white px-2.5 py-2 md:px-3 md:py-2.5">
      <dt className="flex items-center gap-1.5 font-display text-[9px] font-semibold uppercase tracking-[0.11em] text-muted md:gap-2 md:text-[10px] md:tracking-[0.12em]">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
        {label}
      </dt>
      <dd className="mt-0.5 pl-3 font-display text-xs font-semibold leading-snug tracking-[0.02em] text-foreground md:mt-1 md:pl-3.5 md:text-sm md:tracking-[0.03em]">
        {value}
      </dd>
    </div>
  );
}

function JobOpportunityPanel({
  job,
  locale,
  admin,
  picked,
  onCollapse,
}: {
  job: Job;
  locale: Locale;
  admin: boolean;
  picked: boolean;
  onCollapse: () => void;
}) {
  const t = ui(locale);
  const payLabel = job.payCents > 0 ? formatMoney(job.payCents, locale) : "—";
  const cadenceLabel = job.customPayDays
    ? `${locale === "es" ? "Cada" : "Every"} ${job.customPayDays} ${locale === "es" ? "días" : "days"}`
    : job.pay === "weekly"
      ? t.payWeekly
      : t.payBiweekly;
  const level =
    job.qualification === "expert"
      ? locale === "es"
        ? "Experto"
        : "Expert"
      : job.qualification === "intermediate"
        ? locale === "es"
          ? "Intermedio"
          : "Intermediate"
        : locale === "es"
          ? "Principiante"
          : "Beginner";
  const dateLabel = (value: string) =>
    value
      ? new Date(`${value}T12:00:00Z`).toLocaleDateString(locale === "es" ? "es-US" : "en-US", {
          dateStyle: "medium",
          timeZone: "UTC",
        })
      : "—";
  const startDate = job.startsOn ? new Date(`${job.startsOn}T12:00:00Z`) : null;
  const dueDate = job.expiresOn ? new Date(`${job.expiresOn}T12:00:00Z`) : null;
  const hasStart = Boolean(startDate && !Number.isNaN(startDate.getTime()));
  const hasDue = Boolean(dueDate && !Number.isNaN(dueDate.getTime()));
  const now = Date.now();
  const progressPct =
    hasStart && hasDue
      ? Math.round(
          Math.max(
            0,
            Math.min(
              1,
              now <= (startDate as Date).getTime()
                ? 0
                : (now - (startDate as Date).getTime()) /
                    ((dueDate as Date).getTime() - (startDate as Date).getTime()),
            ),
          ) * 100,
        )
      : 0;
  const remainingDays = hasDue
    ? Math.ceil(((dueDate as Date).getTime() - now) / (24 * 60 * 60 * 1000))
    : null;
  const startsSoon = hasStart && (startDate as Date).getTime() > now;
  const isExpired = remainingDays !== null && remainingDays < 0;
  const verification = startsSoon
    ? locale === "es"
      ? "Inicia pronto"
      : "Starts soon"
    : isExpired
      ? locale === "es"
        ? "Plazo vencido"
        : "Expired"
      : remainingDays !== null
        ? `${locale === "es" ? "Tiempo restante" : "Time left"}: ${remainingDays}${locale === "es" ? "d" : "d"}`
        : "—";
  const category = programLabel(job, t);
  const hasLink = job.link.startsWith("https://");

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-sm border border-line bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md md:p-5">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-accent/70" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCollapse}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-line bg-white text-foreground hover:border-ink hover:bg-canvas"
              aria-label={locale === "es" ? "Ocultar detalles" : "Collapse details"}
            >
              <svg viewBox="0 0 12 12" aria-hidden="true" className="h-3 w-3 rotate-90">
                <path d="M4 2.5 8 6 4 9.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {category ? (
              <p className={`inline-flex w-fit border px-2 py-1 font-display text-[11px] font-semibold uppercase tracking-[0.12em] ${categoryTone(job.program)}`}>
                {category}
              </p>
            ) : null}
          </div>
          <h3 className="mt-2 font-display text-3xl font-bold leading-none tracking-wide md:text-4xl">{job.title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-snug text-muted">{job.description}</p>
          {job.message ? (
            <p className="mt-2 max-w-2xl text-sm leading-snug text-foreground">
              <span className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{t.jobMessage}</span>{" "}
              {job.message}
            </p>
          ) : null}
        </div>
        <JobLogo large path={job.logoPath} alt={locale === "es" ? "Logo de empresa" : "Company logo"} />
      </div>

      <dl className="mt-4 grid gap-3 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <div className="rounded-sm border border-accent/30 bg-[#fff7cc] px-3 py-3">
          <dt className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a5b00]">{t.compensation}</dt>
          <dd className="mt-1 font-display text-3xl font-bold leading-none text-foreground">{payLabel}</dd>
          <dd className="mt-1 text-sm font-medium text-[#7a5b00]">{cadenceLabel}</dd>
        </div>
        <div className="grid content-start grid-cols-2 gap-2">
          <Fact label={t.payout} value={cadenceLabel} />
          <Fact label={t.verification} value={verification} />
          <Fact label={t.level} value={level} />
          <Fact label={t.remote} value={job.workMode === "field" ? t.no : job.workMode === "remote" ? t.yes : "—"} />
        </div>
      </dl>

      <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="rounded-sm border border-line bg-canvas px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              {locale === "es" ? "Progreso" : "Progress"}
            </p>
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground">{progressPct}%</p>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
            <div className="h-full bg-accent" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
          {locale === "es" ? "Inicia" : "Begins"} {dateLabel(job.startsOn)}
          <span className="mx-2 text-[#d9c79a]">·</span>
          {locale === "es" ? "Vence" : "Expires"} {dateLabel(job.expiresOn)}
        </p>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">{t.jobPenaltyNote}</p>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {hasLink ? (
          <a
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 w-full items-center justify-center rounded-sm bg-accent px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-[#e0b400] md:min-h-11 md:px-4 md:text-xs md:tracking-[0.14em]"
          >
            {t.jobLink}
          </a>
        ) : null}
        {picked ? (
          <div className={`inline-flex min-h-9 w-full items-center justify-center rounded-sm border border-ink px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] md:min-h-11 md:px-4 md:text-xs md:tracking-[0.14em] ${hasLink ? "" : "sm:col-span-2"}`}>
            {t.selectedJob}
          </div>
        ) : (
          <form action={selectJobAction} className={hasLink ? "" : "sm:col-span-2"}>
            <input type="hidden" name="id" value={job.id} />
            <button
              type="submit"
              className="inline-flex min-h-9 w-full items-center justify-center rounded-sm border border-ink px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-ink hover:text-white md:min-h-11 md:px-4 md:text-xs md:tracking-[0.14em]"
            >
              {t.selectJob}
            </button>
          </form>
        )}
        {admin ? (
          <div className="flex items-center gap-2 sm:col-span-2">
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
        ) : null}
      </div>
    </article>
  );
}

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
  const availableJobs = useMemo(
    () => (admin ? [...jobs] : jobs.filter((job) => !pickedIds.has(job.id))),
    [jobs, chosen, admin],
  );
  const [page, setPage] = useState(1);
  const [openJobs, setOpenJobs] = useState<Record<string, boolean>>({});
  const totalPages = Math.max(1, Math.ceil(availableJobs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedJobs = useMemo(
    () => availableJobs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [availableJobs, safePage],
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
        ) : availableJobs.length === 0 ? (
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
                <li
                  key={job.id}
                  className={expanded ? "" : "border border-[#d9c79a] bg-[#fffdf8] p-2.5 shadow-sm md:p-3"}
                >
                  {expanded ? (
                    <JobOpportunityPanel
                      job={job}
                      locale={locale}
                      admin={admin}
                      picked={picked}
                      onCollapse={() => setOpenJobs((current) => ({ ...current, [job.id]: false }))}
                    />
                  ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenJobs((current) => ({ ...current, [job.id]: true }))}
                      className="inline-flex h-10 w-8 shrink-0 items-center justify-center border border-[#d9c79a] bg-white text-foreground transition-colors hover:border-ink hover:bg-canvas"
                      aria-expanded={false}
                      aria-label={locale === "es" ? "Ver detalles" : "Expand details"}
                      title={locale === "es" ? "Ver detalles" : "Expand details"}
                    >
                      <svg viewBox="0 0 12 12" aria-hidden="true" className="h-3 w-3">
                        <path d="M4 2.5 8 6 4 9.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                        <div className="min-w-0 max-w-3xl">
                          <div className="flex items-center gap-3">
                            <JobLogo
                              path={job.logoPath}
                              alt={locale === "es" ? "Logo de empresa" : "Company logo"}
                            />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-display text-lg font-bold uppercase leading-none tracking-wide md:text-xl">
                                  {job.title}
                                </p>
                                <span
                                  className={`inline-flex min-h-6 items-center rounded-full border px-2 font-display text-[10px] font-semibold uppercase tracking-[0.12em] ${qualificationTone(job.qualification)}`}
                                >
                                  {qualificationLabel(job.qualification)}
                                </span>
                                {job.workMode ? (
                                  <span className="inline-flex min-h-6 items-center rounded-full border border-line bg-white px-2 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground">
                                    {job.workMode === "field" ? t.workField : t.remote}
                                  </span>
                                ) : null}
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <p className="text-xs text-foreground">
                                  <span className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                                    {locale === "es" ? "Inicia" : "Begins"}
                                  </span>
                                  <span className="ml-1.5 font-medium">{startsLabel}</span>
                                </p>
                                <span aria-hidden="true" className="hidden h-3 w-px bg-[#d9c79a] sm:inline-block" />
                                <p className="text-xs text-foreground">
                                  <span className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                                    {locale === "es" ? "Vence" : "Expires"}
                                  </span>
                                  <span className="ml-1.5 font-medium">{expiresLabel}</span>
                                </p>
                                <span aria-hidden="true" className="hidden h-3 w-px bg-[#d9c79a] sm:inline-block" />
                                <p className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a5b00]">
                                  {cadenceLabel(job)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>
                        <div className="flex shrink-0 flex-col items-end">
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
                          <p className="mt-5 font-display text-2xl font-bold leading-none text-black [font-variant-numeric:tabular-nums]">
                            {payLabel}
                          </p>
                        </div>
                  </div>
                  )}
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
