import { formatMoney } from "@/lib/money";
import type { Locale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import type { Job } from "@/lib/jobs";

export function JobFacts({ job, locale }: { job: Job; locale: Locale }) {
  const t = ui(locale);
  const labels = locale === "es"
    ? {
        pay: "Pago",
        due: "Vence",
        progress: "Progreso",
        timeLeft: "Tiempo restante",
        expired: "Plazo vencido",
        startsSoon: "Inicia pronto",
        days: "d",
      }
    : {
        pay: "Pay",
        due: "Due",
        progress: "Progress",
        timeLeft: "Time left",
        expired: "Expired",
        startsSoon: "Starts soon",
        days: "d",
      };
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
  const cycleDays = job.pay === "weekly" ? 7 : 14;
  const startDate = job.startsOn ? new Date(`${job.startsOn}T12:00:00Z`) : null;
  const hasStartDate = Boolean(startDate && !Number.isNaN(startDate.getTime()));
  const dueDate = hasStartDate
    ? new Date((startDate as Date).getTime() + cycleDays * 24 * 60 * 60 * 1000)
    : null;
  const now = new Date();
  const progressRatio = hasStartDate && dueDate
    ? Math.max(
        0,
        Math.min(
          1,
          now.getTime() <= (startDate as Date).getTime()
            ? 0
            : (now.getTime() - (startDate as Date).getTime()) / (dueDate.getTime() - (startDate as Date).getTime()),
        ),
      )
    : 0;
  const progressPct = Math.round(progressRatio * 100);
  const remainingDays = dueDate
    ? Math.ceil((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    : null;
  const isExpired = remainingDays !== null && remainingDays < 0;
  const startsSoon = hasStartDate && (startDate as Date).getTime() > now.getTime();
  const dueText = dueDate
    ? dueDate.toLocaleDateString(locale === "es" ? "es-US" : "en-US", {
        dateStyle: "medium",
        timeZone: "UTC",
      })
    : "";
  const when = startDate
    ? (startDate as Date).toLocaleDateString(locale === "es" ? "es-US" : "en-US", {
        dateStyle: "medium",
        timeZone: "UTC",
      })
    : "";
  const payAmount = job.payCents > 0 ? formatMoney(job.payCents, locale) : "";
  const facts = [
    program,
    job.pay === "weekly" ? t.payWeekly : t.payBiweekly,
    when,
  ].filter(Boolean);

  return (
    <>
      <div className="mt-2 rounded-sm border border-[#d9c79a] bg-[#fff4d6] px-2.5 py-2.5">
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a5b00]">
          {labels.pay}
        </p>
        <p className="mt-0.5 font-display text-xl font-bold leading-tight text-foreground">{payAmount || "—"}</p>
        <p className="text-[11px] font-medium text-[#7a5b00]">
          {job.pay === "weekly" ? t.payWeekly : t.payBiweekly}
        </p>
      </div>

      <ul className="mt-2.5 flex flex-wrap gap-1.5">
        {facts.map((fact) => (
          <li
            key={fact}
            className="inline-flex min-h-7 items-center border border-line bg-canvas px-2 font-display text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground"
          >
            {fact}
          </li>
        ))}
      </ul>

      <div className="mt-2.5 rounded-sm border border-line bg-white px-2.5 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            {labels.progress}
          </p>
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            {labels.due}: {dueText || "—"}
          </p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-canvas">
          <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.11em] text-foreground">
            {progressPct}%
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.11em] text-muted">
            {startsSoon
              ? labels.startsSoon
              : isExpired
                ? labels.expired
                : remainingDays !== null
                  ? `${labels.timeLeft}: ${remainingDays}${labels.days}`
                  : "—"}
          </p>
        </div>
      </div>

      <details className="mt-2.5 rounded-sm border border-line bg-canvas px-2.5 py-2">
        <summary className="cursor-pointer list-none font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          {locale === "es" ? "Resumen del trabajo" : "Job overview"}
        </summary>
        <p
          className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {job.description}
        </p>
        {job.message ? (
          <p
            className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
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
