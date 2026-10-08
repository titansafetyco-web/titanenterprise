import { formatMoney } from "@/lib/money";
import type { Locale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { timerHeat } from "@/lib/job-timer";
import type { Job } from "@/lib/jobs";

const heatFill = {
  cool: "bg-[#16a34a]",
  warm: "bg-accent",
  hot: "bg-[#e11d48]",
  done: "bg-[#16a34a]",
  incomplete: "bg-[#e11d48]",
};

function formatLeft(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const remain = safe % 60;
  return [hours, minutes, remain].map((part) => String(part).padStart(2, "0")).join(":");
}

export function JobFacts({
  job,
  locale,
  timer,
}: {
  job: Job;
  locale: Locale;
  timer: {
    shownSeconds: number;
    now: number;
    status: "processing" | "review" | "done" | "incomplete";
  };
}) {
  const t = ui(locale);
  const labels = locale === "es"
    ? { pay: "Pago" }
    : { pay: "Pay" };
  const program =
    job.program === "safety"
      ? t.jobProgramSafety
      : job.program === "energy"
        ? t.jobProgramEnergy
        : job.program === "media"
          ? t.jobProgramMedia
          : job.program === "software"
            ? t.jobProgramSoftware
            : job.program === "insurance"
              ? t.jobProgramInsurance
              : "";
  const payAmount = job.payCents > 0 ? formatMoney(job.payCents, locale) : "";
  const cadenceLabel = job.customPayDays
    ? `${locale === "es" ? "Cada" : "Every"} ${job.customPayDays} ${locale === "es" ? "días" : "days"}`
    : job.pay === "weekly"
      ? t.payWeekly
      : t.payBiweekly;

  return (
    <>
      <div className="mt-1.5 grid gap-2 md:grid-cols-2">
        <div className="w-full rounded-sm border border-[#d9c79a] bg-[#fff4d6] px-2.5 py-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="-mt-0.5 inline-flex min-h-5 items-center border border-[#d9c79a] px-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a5b00]">
                {locale === "es" ? "Pago" : "Payout"}
              </span>
              <p className="mt-3.5 font-display text-[2.25rem] font-black leading-none tracking-[-0.025em] text-foreground [font-variant-numeric:tabular-nums]">
                {payAmount || "—"}
              </p>
            </div>
            <div className="mt-0.5 rounded-sm border border-[#d9c79a] bg-[#fff9ea] px-2 py-1 text-right">
              <p className="font-display text-[10px] font-semibold uppercase tracking-[0.13em] text-[#7a5b00]">
                {labels.pay}
              </p>
              <p className="mt-0.5 font-display text-[14px] font-bold uppercase tracking-[0.13em] text-[#6d5100]">
                {cadenceLabel}
              </p>
            </div>
          </div>
          <div className="mt-1.5 flex items-center justify-end gap-1">
            {program ? (
              <span className="inline-flex min-h-6 items-center rounded-full border border-[#cda434] bg-white px-2 font-display text-[9px] font-semibold uppercase tracking-[0.1em] text-[#6d5100]">
                {program}
              </span>
            ) : null}
          </div>
        </div>

        <JobPace
          startsOn={job.startsOn}
          expiresOn={job.expiresOn}
          elapsed={timer.shownSeconds}
          startedAt=""
          status={timer.status}
          now={timer.now}
          locale={locale}
        />
      </div>

      <details className="mt-2 rounded-sm border border-line bg-canvas px-2.5 py-2">
        <summary className="cursor-pointer list-none font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          {locale === "es" ? "Resumen del trabajo" : "Job overview"}
        </summary>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {job.description}
        </p>
        {job.message ? (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
            <span className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              {t.jobMessage}
            </span>{" "}
            {job.message}
          </p>
        ) : null}
        {job.link.startsWith("https://") ? (
          <a
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-8 items-center border border-line bg-white px-2.5 font-display text-[10px] font-semibold uppercase tracking-[0.11em] text-accent hover:border-accent/40"
          >
            {t.jobLink}
          </a>
        ) : null}
      </details>
    </>
  );
}

export function JobPace({
  startsOn,
  expiresOn,
  elapsed,
  startedAt,
  status,
  now,
  locale,
}: {
  startsOn: string;
  expiresOn: string;
  elapsed: number;
  startedAt: string;
  status: "processing" | "review" | "done" | "incomplete";
  now: number;
  locale: Locale;
}) {
  const labels = locale === "es"
    ? { due: "Vence", progress: "Progreso", timeLeft: "Tiempo restante" }
    : { due: "Due", progress: "Progress", timeLeft: "Time left" };
  const startDate = startsOn ? new Date(`${startsOn}T00:00:00Z`) : null;
  const explicitExpiry = expiresOn ? new Date(`${expiresOn}T12:00:00Z`) : null;
  const dueDate = explicitExpiry && !Number.isNaN(explicitExpiry.getTime()) ? explicitExpiry : null;
  const heat = timerHeat(
    {
      expiresOn,
      startsOn,
      elapsed,
      startedAt,
      status: status === "review" ? "processing" : status,
    },
    now,
  );
  const progressPct = Math.round(heat.ratio * 100);
  const leftLabel =
    heat.tone === "done"
      ? locale === "es"
        ? "Hecho"
        : "Done"
      : heat.tone === "incomplete"
        ? locale === "es"
          ? "Incompleto"
          : "Incomplete"
        : `${labels.timeLeft}: ${formatLeft(heat.remainingSeconds)}`;
  const dueText = dueDate
    ? dueDate.toLocaleDateString(locale === "es" ? "es-US" : "en-US", { dateStyle: "medium", timeZone: "UTC" })
    : "";
  const when = startDate && !Number.isNaN(startDate.getTime())
    ? startDate.toLocaleDateString(locale === "es" ? "es-US" : "en-US", { dateStyle: "medium", timeZone: "UTC" })
    : "";

  return (
    <div className="rounded-sm border border-line bg-white px-2.5 py-2">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
          {labels.progress}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-1">
          {when ? (
            <span className="inline-flex min-h-6 items-center border border-line bg-canvas px-1.5 font-display text-[9px] font-semibold uppercase tracking-[0.1em] text-foreground">
              {locale === "es" ? "Inicia: " : "Begins: "}
              {when}
            </span>
          ) : null}
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            {labels.due}: {dueText || "—"}
          </p>
        </div>
      </div>
      <div className="mt-1.5 grid grid-cols-12 gap-0.5" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => {
          const fill = Math.max(0, Math.min(1, heat.ratio * 12 - index));
          return (
            <span key={index} className="h-2 overflow-hidden bg-canvas">
              <span className={`block h-full ${heatFill[heat.tone]}`} style={{ width: `${fill * 100}%` }} />
            </span>
          );
        })}
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.11em] text-foreground">
          {progressPct}%
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.11em] text-muted">{leftLabel}</p>
      </div>
    </div>
  );
}
