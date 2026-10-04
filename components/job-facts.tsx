import { formatMoney } from "@/lib/money";
import type { Locale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import type { Job } from "@/lib/jobs";

export function JobFacts({ job, locale }: { job: Job; locale: Locale }) {
  const t = ui(locale);
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
  const when = job.startsOn
    ? new Date(`${job.startsOn}T12:00:00Z`).toLocaleDateString(locale === "es" ? "es-US" : "en-US", {
        dateStyle: "medium",
        timeZone: "UTC",
      })
    : "";
  const facts = [
    program,
    job.payCents > 0 ? formatMoney(job.payCents, locale) : "",
    job.pay === "weekly" ? t.payWeekly : t.payBiweekly,
    when,
  ].filter(Boolean);

  return (
    <>
      <p className="mt-2 font-display text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        {facts.join(" · ")}
      </p>
      <p className="mt-3 whitespace-pre-wrap leading-relaxed">{job.description}</p>
      {job.message ? (
        <p className="mt-3 whitespace-pre-wrap leading-relaxed">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {t.jobMessage}
          </span>
          <span className="mt-1 block">{job.message}</span>
        </p>
      ) : null}
      {job.link.startsWith("https://") ? (
        <a
          href={job.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm underline"
        >
          {t.jobLink}
        </a>
      ) : null}
    </>
  );
}
