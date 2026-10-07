"use client";

import { useEffect, useState } from "react";
import { setJobProgressAction, startJobTimerAction, stopJobTimerAction, unselectJobAction } from "@/app/jobs/actions";
import { JobFacts } from "@/components/job-facts";
import { JobLogo } from "@/components/job-logo";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";
import type { ChosenJob } from "@/lib/jobs";
import { formatMoney } from "@/lib/money";

function formatSeconds(value: number) {
  const safe = Math.max(0, Math.floor(value));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function TimerReadout({ seconds, startedAt, running }: { seconds: number; startedAt: string; running: boolean }) {
  const [shown, setShown] = useState(seconds);

  useEffect(() => {
    if (!running) {
      setShown(seconds);
      return;
    }
    const startedMs = Date.parse(startedAt);
    const hasStart = Number.isFinite(startedMs);
    const clickedAt = Date.now();
    const tick = () => {
      if (hasStart) {
        setShown(seconds + Math.max(0, Math.floor((Date.now() - startedMs) / 1000)));
        return;
      }
      setShown(seconds + Math.max(0, Math.floor((Date.now() - clickedAt) / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [running, seconds, startedAt]);

  return <>{formatSeconds(shown)}</>;
}

export function ChosenJobs({ jobs, error }: { jobs: readonly ChosenJob[]; error: string }) {
  const locale = useLocale();
  const t = ui(locale);
  const [openJobs, setOpenJobs] = useState<Record<string, boolean>>({});
  const [pendingRun, setPendingRun] = useState<Record<string, boolean>>({});
  const [closedJobs, setClosedJobs] = useState<Record<string, "done" | "incomplete">>({});
  const [progressError, setProgressError] = useState("");
  const statusLabel = {
    processing: t.jobProcessing,
    done: t.jobDone,
    incomplete: t.jobIncomplete,
  };
  const qualificationLabel = (value: ChosenJob["qualification"]) =>
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
  const qualificationTone = (value: ChosenJob["qualification"]) =>
    value === "expert"
      ? "border-[#cda434] bg-[#fff4d6] text-[#7a5b00]"
      : value === "intermediate"
        ? "border-[#9bb8e8] bg-[#eaf2ff] text-[#2c4d86]"
        : "border-[#c6d9c8] bg-[#eaf7eb] text-[#1d6a42]";
  const cadenceLabel = (job: ChosenJob) =>
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
  const jobStatus = (job: ChosenJob) => closedJobs[job.id] ?? job.status;
  const owedCents = jobs.reduce((total, job) => (jobStatus(job) === "done" ? total + job.payCents : total), 0);
  const pendingCents = jobs.reduce((total, job) => {
    const closed = jobStatus(job) === "done" || jobStatus(job) === "incomplete";
    const running = !closed && (pendingRun[job.id] ?? job.timerRunning);
    return running ? total + job.payCents : total;
  }, 0);

  return (
    <section className="bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-5">
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide">{t.yourJobs}</h2>
        <div className="flex items-stretch gap-2">
          <div className="min-w-[6.5rem] border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-right">
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-[#15803d]">
              {locale === "es" ? "Adeudado" : "Owed"}
            </p>
            <p className="mt-0.5 font-display text-xl font-bold leading-none text-[#16a34a] [font-variant-numeric:tabular-nums]">
              {formatMoney(owedCents, locale)}
            </p>
          </div>
          <div className="min-w-[6.5rem] border border-[#eadfbe] bg-[#fffdf8] px-3 py-2 text-right">
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              {locale === "es" ? "Pendiente" : "Pending"}
            </p>
            <p className="mt-0.5 font-display text-xl font-bold leading-none text-foreground [font-variant-numeric:tabular-nums]">
              {formatMoney(pendingCents, locale)}
            </p>
          </div>
        </div>
      </div>
      {error ? (
        <p className="px-6 py-8 text-muted">{localizeError(locale, error)}</p>
      ) : jobs.length === 0 ? (
        <p className="px-6 py-8 text-muted">{t.noChosenJobs}</p>
      ) : (
        <ul className="grid gap-2.5 bg-[#f5efe2] p-2.5 md:gap-3 md:p-3">
          {jobs.map((job) => {
            const expanded = Boolean(openJobs[job.id]);
            const status = closedJobs[job.id] ?? job.status;
            const closed = status === "done" || status === "incomplete";
            const running = !closed && (pendingRun[job.id] ?? job.timerRunning);
            const payLabel = job.payCents > 0 ? formatMoney(job.payCents, locale) : "—";
            return (
              <li key={job.id} className="border border-[#d9c79a] bg-[#fffdf8] p-2.5 shadow-sm md:p-3">
                <div className="min-w-0">
                    <div className={`flex items-center gap-2 ${expanded ? "border-b border-[#eadfbe] pb-2" : ""}`}>
                      <button
                        type="button"
                        onClick={() => setOpenJobs((current) => ({ ...current, [job.id]: !expanded }))}
                        className="inline-flex h-12 w-8 shrink-0 items-center justify-center border border-[#d9c79a] bg-white text-foreground transition-colors hover:border-ink hover:bg-canvas"
                        aria-label={expanded ? (locale === "es" ? "Ocultar detalles" : "Collapse details") : (locale === "es" ? "Ver detalles" : "Expand details")}
                        title={locale === "es" ? "Resumen del trabajo" : "Job overview"}
                      >
                        <svg
                          viewBox="0 0 12 12"
                          aria-hidden="true"
                          className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`}
                        >
                          <path d="M4 2.5 8 6 4 9.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <JobLogo
                        path={job.logoPath}
                        alt={locale === "es" ? "Logo de empresa" : "Company logo"}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display text-base font-semibold uppercase tracking-wide md:text-lg">
                            {job.title}
                          </p>
                          <span
                            className={`inline-flex min-h-7 items-center rounded-full border px-2.5 font-display text-[10px] font-semibold uppercase tracking-[0.14em] ${qualificationTone(job.qualification)}`}
                          >
                            {locale === "es" ? "Nivel" : "Level"}: {qualificationLabel(job.qualification)}
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex min-h-6 items-center border border-line bg-canvas px-2 font-display text-[10px] font-semibold uppercase tracking-[0.11em] text-foreground">
                            {locale === "es" ? "Inicia" : "Begins"}: {dateLabel(job.startsOn)}
                          </span>
                          <span className="inline-flex min-h-6 items-center border border-line bg-canvas px-2 font-display text-[10px] font-semibold uppercase tracking-[0.11em] text-foreground">
                            {locale === "es" ? "Vence" : "Expires"}: {dateLabel(job.expiresOn)}
                          </span>
                          <span className="inline-flex min-h-6 items-center border border-line bg-white px-2 font-display text-[10px] font-semibold uppercase tracking-[0.11em] text-muted">
                            {cadenceLabel(job)}
                          </span>
                        </div>
                      </div>
                      <span className="ml-auto shrink-0 font-display text-3xl font-bold leading-none text-foreground [font-variant-numeric:tabular-nums]">
                        {payLabel}
                      </span>
                    </div>

                    {expanded ? (
                      <div className="mt-2">
                        <JobFacts job={job} locale={locale} />
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <div className="inline-flex h-12 items-center gap-2 border border-[#d9c79a] bg-[#fff4d6] px-2">
                            <div>
                              <p className="font-display text-[9px] font-semibold uppercase tracking-[0.12em] text-[#7a5b00]">
                                {locale === "es" ? "Temporizador" : "Timer"}
                              </p>
                              <p className="font-display text-sm font-bold tracking-[0.08em] text-foreground [font-variant-numeric:tabular-nums]">
                                <TimerReadout seconds={job.timerElapsedSeconds} startedAt={job.timerStartedAt} running={running} />
                              </p>
                            </div>
                            {closed ? null : !running ? (
                              <form action={startJobTimerAction}>
                                <input type="hidden" name="id" value={job.id} />
                                <button
                                  type="submit"
                                  onClick={() => setPendingRun((current) => ({ ...current, [job.id]: true }))}
                                  className="inline-flex h-8 items-center border border-[#0f766e] bg-[#dcfce7] px-2.5 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0f766e] hover:bg-[#bbf7d0]"
                                >
                                  {locale === "es" ? "Iniciar" : "Start"}
                                </button>
                              </form>
                            ) : (
                              <form action={stopJobTimerAction}>
                                <input type="hidden" name="id" value={job.id} />
                                <button
                                  type="submit"
                                  onClick={() => setPendingRun((current) => ({ ...current, [job.id]: false }))}
                                  className="inline-flex h-8 items-center border border-[#9f1239] bg-[#ffe4e6] px-2.5 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9f1239] hover:bg-[#fecdd3]"
                                >
                                  {locale === "es" ? "Detener" : "Stop"}
                                </button>
                              </form>
                            )}
                          </div>
                          <form onSubmit={(event) => event.preventDefault()}>
                            <input type="hidden" name="id" value={job.id} />
                            <label className="block">
                              <span className="sr-only">{t.jobProgressLabel}</span>
                              <select
                                name="status"
                                key={`${job.id}-${status}`}
                                defaultValue={status}
                                onChange={async (event) => {
                                  const select = event.currentTarget;
                                  const next = select.value;
                                  const data = new FormData();
                                  data.set("id", job.id);
                                  data.set("status", next);
                                  const result = await setJobProgressAction(data);
                                  if (result.error) {
                                    select.value = status;
                                    setProgressError(result.error);
                                    return;
                                  }
                                  setProgressError("");
                                  if (next === "done" || next === "incomplete") {
                                    setClosedJobs((current) => ({ ...current, [job.id]: next }));
                                    setPendingRun((current) => ({ ...current, [job.id]: false }));
                                  }
                                }}
                                className="h-12 border border-line bg-white px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground outline-none focus-visible:border-accent"
                              >
                                {(Object.keys(statusLabel) as (keyof typeof statusLabel)[])
                                  .filter((option) => !closed || option !== "processing")
                                  .map((option) => (
                                    <option key={option} value={option}>
                                      {statusLabel[option]}
                                    </option>
                                  ))}
                              </select>
                            </label>
                          </form>
                          {status === "done" ? null : (
                          <form action={unselectJobAction}>
                            <input type="hidden" name="id" value={job.id} />
                            <button
                              type="submit"
                              className="inline-flex h-12 items-center border border-ink bg-white px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-ink hover:bg-ink hover:text-white"
                            >
                              {t.remove}
                            </button>
                          </form>
                          )}
                        </div>
                        {progressError ? <p className="mt-2 text-sm text-muted">{localizeError(locale, progressError)}</p> : null}
                      </div>
                    ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
