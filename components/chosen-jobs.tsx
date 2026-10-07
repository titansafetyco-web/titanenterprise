"use client";

import { useEffect, useRef, useState } from "react";
import { setJobProgressAction, startJobTimerAction, stopJobTimerAction, unselectJobAction } from "@/app/jobs/actions";
import { JobFacts } from "@/components/job-facts";
import { JobLogo } from "@/components/job-logo";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";
import { JOB_OPEN_LIMIT_SECONDS, expirationDeadline, pauseExceeded, timerTotalSeconds } from "@/lib/job-timer";
import type { ChosenJob } from "@/lib/jobs";
import { formatMoney } from "@/lib/money";

function formatSeconds(value: number) {
  const safe = Math.max(0, Math.floor(value));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function TimerReadout({ seconds }: { seconds: number }) {
  return <>{formatSeconds(seconds)}</>;
}

function TimerRules({
  locale,
  expiresOn,
  expiresLabel,
}: {
  locale: "en" | "es";
  expiresOn: string;
  expiresLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dated = Boolean(expirationDeadline(expiresOn));
  const label = locale === "es" ? "Reglas del temporizador" : "Timer rules";

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const lines = dated
    ? locale === "es"
          ? [
              `Este trabajo vence el ${expiresLabel}.`,
              "El temporizador corre al elegir el trabajo y sigue si sales o cierras el navegador. Pausar lo detiene hasta el final de ese día.",
              "El límite de 12 horas no aplica.",
              "Después de la fecha de vencimiento, el trabajo pasa a revisión. Si se verifica como incompleto, se cobra el pago indicado.",
            ]
          : [
              `This job expires on ${expiresLabel}.`,
              "The timer starts with the job and keeps running if you leave or close the browser. Pause stops it through the end of that day.",
              "The 12-hour limit does not apply.",
              "After the expiration date, the job goes to review. If it is verified as unfinished, the listed pay is charged.",
            ]
        : locale === "es"
          ? [
              "El temporizador corre al elegir el trabajo y sigue si sales o cierras el navegador. Pausar lo detiene.",
              "Si el temporizador corre más de 12 horas, o una pausa dura más de 12 horas, el trabajo pasa a revisión.",
              "El pago espera la verificación. Si el trabajo se verifica como incompleto, se cobra el pago indicado.",
            ]
          : [
              "The timer starts with the job and keeps running if you leave or close the browser. Pause stops it.",
              "If the timer runs longer than 12 hours, or a pause lasts longer than 12 hours, the job goes to review.",
              "Pay waits for verification. If the job is verified as unfinished, the listed pay is charged.",
            ];

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#7a5b00] bg-white font-display text-[11px] font-bold leading-none text-[#7a5b00] hover:bg-[#fffdf8]"
      >
        ?
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label={label}
          className="absolute left-0 top-7 z-20 w-64 border border-[#d9c79a] bg-white p-3 shadow-lg"
        >
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a5b00]">{label}</p>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-foreground">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function ChosenJobs({ jobs, error }: { jobs: readonly ChosenJob[]; error: string }) {
  const locale = useLocale();
  const t = ui(locale);
  const [openJobs, setOpenJobs] = useState<Record<string, boolean>>({});
  const [pendingRun, setPendingRun] = useState<Record<string, boolean>>({});
  const [closedJobs, setClosedJobs] = useState<Record<string, "review" | "done" | "incomplete">>({});
  const [now, setNow] = useState(() => Date.now());
  const clickStarts = useRef<Record<string, number>>({});
  const [progressError, setProgressError] = useState("");
  const closing = useRef(new Set<string>());
  const statusLabel = {
    processing: t.jobProcessing,
    review: t.jobReview,
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
  const jobStatus = (job: ChosenJob): ChosenJob["status"] => closedJobs[job.id] ?? job.status;

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const timers: number[] = [];
    const close = (jobId: string) => {
      if (closing.current.has(jobId)) return;
      closing.current.add(jobId);
      const data = new FormData();
      data.set("id", jobId);
      data.set("status", "review");
      void setJobProgressAction(data).then((result) => {
        if (result.error) {
          closing.current.delete(jobId);
          return;
        }
        setClosedJobs((current) => ({ ...current, [jobId]: "review" }));
        setPendingRun((current) => ({ ...current, [jobId]: false }));
      });
    };
    for (const job of jobs) {
      if (jobStatus(job) !== "processing") continue;
      const deadline = expirationDeadline(job.expiresOn);
      if (deadline !== null) {
        const waitMs = deadline - Date.now() + 1000;
        if (waitMs <= 1000) close(job.id);
        else timers.push(window.setTimeout(() => close(job.id), waitMs));
        continue;
      }
      const running = pendingRun[job.id] ?? job.timerRunning;
      if (running) {
        const total = timerTotalSeconds(job.timerElapsedSeconds, job.timerStartedAt);
        const waitMs = (JOB_OPEN_LIMIT_SECONDS - total) * 1000 + 1000;
        if (waitMs <= 1000) close(job.id);
        else timers.push(window.setTimeout(() => close(job.id), waitMs));
        continue;
      }
      if (job.timerElapsedSeconds > 0 && job.timerPausedAt) {
        if (pauseExceeded(job.timerPausedAt)) {
          close(job.id);
          continue;
        }
        const paused = Date.parse(job.timerPausedAt);
        if (!Number.isFinite(paused)) continue;
        const waitMs = paused + JOB_OPEN_LIMIT_SECONDS * 1000 - Date.now() + 1000;
        if (waitMs > 0) timers.push(window.setTimeout(() => close(job.id), waitMs));
      }
    }
    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [jobs, closedJobs, pendingRun]);

  const owedCents = jobs.reduce((total, job) => (jobStatus(job) === "done" ? total + job.payCents : total), 0);
  const pendingCents = jobs.reduce((total, job) => {
    const running = jobStatus(job) === "processing" && (pendingRun[job.id] ?? job.timerRunning);
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
            const status = jobStatus(job);
            const open = status === "processing";
            const running = open && (pendingRun[job.id] ?? job.timerRunning);
            const startedAt = job.timerStartedAt;
            const hasStart = Number.isFinite(Date.parse(startedAt));
            const clickedAt = clickStarts.current[job.id];
            const shownSeconds = !running
              ? job.timerElapsedSeconds
              : hasStart
                ? timerTotalSeconds(job.timerElapsedSeconds, startedAt, now)
                : job.timerElapsedSeconds + Math.max(0, Math.floor((now - (clickedAt ?? now)) / 1000));
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
                          {job.workMode ? (
                            <span className="inline-flex min-h-7 items-center rounded-full border border-line bg-canvas px-2.5 font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground">
                              {job.workMode === "field" ? t.workField : t.remote}
                            </span>
                          ) : null}
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
                      <div className="inline-flex h-12 shrink-0 items-center gap-2 border border-[#d9c79a] bg-[#fff4d6] px-2">
                        <div>
                          <p className="font-display text-[9px] font-semibold uppercase tracking-[0.12em] text-[#7a5b00]">
                            {locale === "es" ? "Temporizador" : "Timer"}
                          </p>
                          <p className="font-display text-sm font-bold tracking-[0.08em] text-foreground [font-variant-numeric:tabular-nums]">
                            <TimerReadout seconds={shownSeconds} />
                          </p>
                        </div>
                        {!open ? null : !running ? (
                          <form action={startJobTimerAction}>
                            <input type="hidden" name="id" value={job.id} />
                            <button
                              type="submit"
                              onClick={() => {
                                clickStarts.current[job.id] = Date.now();
                                setPendingRun((current) => ({ ...current, [job.id]: true }));
                              }}
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
                              aria-label={locale === "es" ? "Pausar" : "Pause"}
                              title={locale === "es" ? "Pausar" : "Pause"}
                              className="inline-flex h-8 w-8 items-center justify-center border border-[#9f1239] bg-[#ffe4e6] text-[#9f1239] hover:bg-[#fecdd3]"
                            >
                              <svg viewBox="0 0 12 12" aria-hidden="true" className="h-3.5 w-3.5">
                                <path d="M3.25 2.25v7.5M8.75 2.25v7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                              </svg>
                            </button>
                          </form>
                        )}
                        <TimerRules locale={locale} expiresOn={job.expiresOn} expiresLabel={dateLabel(job.expiresOn)} />
                      </div>
                      <span className="shrink-0 font-display text-3xl font-bold leading-none text-foreground [font-variant-numeric:tabular-nums]">
                        {payLabel}
                      </span>
                    </div>

                    {expanded ? (
                      <div className="mt-2">
                        <JobFacts job={job} locale={locale} timer={{ shownSeconds, now, status }} />
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {open ? (
                            <form
                              action={(async (formData) => {
                                const result = await setJobProgressAction(formData);
                                if (result.error) {
                                  setProgressError(result.error);
                                  return;
                                }
                                setProgressError("");
                                setClosedJobs((current) => ({ ...current, [job.id]: "review" }));
                                setPendingRun((current) => ({ ...current, [job.id]: false }));
                              })}
                            >
                              <input type="hidden" name="id" value={job.id} />
                              <input type="hidden" name="status" value="review" />
                              <button
                                type="submit"
                                className="inline-flex h-12 items-center border border-ink bg-ink px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-white hover:bg-white hover:text-ink"
                              >
                                {t.submitReview}
                              </button>
                            </form>
                          ) : (
                            <span className="inline-flex h-12 items-center border border-line bg-white px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">
                              {statusLabel[status]}
                            </span>
                          )}
                          {open ? (
                          <form action={unselectJobAction}>
                            <input type="hidden" name="id" value={job.id} />
                            <button
                              type="submit"
                              className="inline-flex h-12 items-center border border-ink bg-white px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-ink hover:bg-ink hover:text-white"
                            >
                              {t.remove}
                            </button>
                          </form>
                          ) : null}
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
