import Link from "next/link";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { JobRow } from "@/components/dashboard/JobRow";
import type { AffiliateApplication } from "@/lib/applications";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import type { ChosenJob, JobProgress } from "@/lib/jobs";
import { formatMoney, type WalletEntry } from "@/lib/money";
import type { OwnPayout } from "@/lib/wallet";

const tones: Record<JobProgress, string> = {
  processing: "#101820",
  review: "#7a5b00",
  done: "#f5c400",
  incomplete: "#6b7280",
};

function moneyTone(cents: number) {
  return cents > 0
    ? "font-semibold text-[#22c55e]"
    : "text-muted";
}

export async function MemberOverview({
  name,
  balanceCents,
  payouts,
  jobs,
  applications,
  history,
  error,
}: {
  name: string;
  balanceCents: number;
  payouts: OwnPayout[];
  jobs: ChosenJob[];
  applications: AffiliateApplication[];
  history: WalletEntry[];
  error: string;
}) {
  const locale = await getLocale();
  const t = ui(locale);
  const waiting = payouts.filter((item) => item.status === "pending").reduce((total, item) => total + item.amountCents, 0);
  const sent = payouts.filter((item) => item.status === "sent").reduce((total, item) => total + item.amountCents, 0);
  const pay = [
    { label: t.walletBalance, cents: balanceCents, tone: "#f5c400" },
    { label: t.payoutsPending, cents: waiting, tone: "#6b7280" },
    { label: t.payoutsMade, cents: sent, tone: "#22c55e" },
  ];
  const counts: Record<JobProgress, number> = {
    processing: jobs.filter((job) => job.status === "processing").length,
    review: jobs.filter((job) => job.status === "review").length,
    done: jobs.filter((job) => job.status === "done").length,
    incomplete: jobs.filter((job) => job.status === "incomplete").length,
  };
  const jobCards = [
    { label: t.jobProcessing, value: counts.processing + counts.review, tone: tones.processing },
    { label: t.jobDone, value: counts.done, tone: tones.done },
    { label: t.jobIncomplete, value: counts.incomplete, tone: tones.incomplete },
  ];
  const statusLabel = (status: AffiliateApplication["status"]) =>
    status === "approved" ? t.statusApproved : status === "denied" ? t.statusDenied : t.statusPending;

  return (
    <>
      <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">{name}</p>
      <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">{t.dashboard}</h1>
      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide">{t.overview}</h2>
        {error ? <p className="mt-4 text-muted">{error}</p> : null}
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {pay.map((card) => (
            <li key={card.label} className="border-t-4 bg-white p-6" style={{ borderColor: card.tone }}>
              <p className={`font-display text-4xl font-bold ${moneyTone(card.cents)}`}>
                {formatMoney(card.cents, locale)}
              </p>
              <p className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">
                {card.label}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide">{t.yourJobs}</h2>
          <Link
            href="/dashboard/jobs"
            className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-accent hover:text-foreground"
          >
            {t.yourJobs}
          </Link>
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {jobCards.map((card) => (
            <li key={card.label} className="border-t-4 bg-white p-6" style={{ borderColor: card.tone }}>
              <p className="font-display text-4xl font-bold">{card.value}</p>
              <p className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">
                {card.label}
              </p>
            </li>
          ))}
        </ul>
        {jobs.length === 0 ? (
          <p className="mt-4 bg-white px-6 py-8 text-sm text-muted">{t.noChosenJobs}</p>
        ) : (
          <ul className="mt-4 border border-line bg-white">
            {jobs.map((job) => (
              <JobRow key={job.id} title={job.title} status={job.status} locale={locale} />
            ))}
          </ul>
        )}

        <h2 className="mt-8 font-display text-2xl font-bold uppercase tracking-wide">{t.earnings}</h2>
        <div className="mt-4">
          <ActivityFeed items={history} locale={locale} empty={history.length === 0 && balanceCents === 0 ? t.noEarnings : t.notAvailableYet} />
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide">{t.yourOnboarding}</h2>
          <Link
            href="/dashboard/onboarding"
            className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-accent hover:text-foreground"
          >
            {t.yourOnboarding}
          </Link>
        </div>
        {applications.length === 0 ? (
          <p className="mt-4 bg-white px-6 py-8 text-sm text-muted">{t.noOwnOnboarding}</p>
        ) : (
          <ul className="mt-4 border border-line bg-white">
            {applications.map((item, index) => (
              <li
                key={item.id}
                className={`flex flex-wrap items-center justify-between gap-3 px-6 py-4 ${index % 2 === 0 ? "bg-canvas" : "bg-white"}`}
              >
                <p className="font-display text-sm font-semibold uppercase tracking-wide">{item.program}</p>
                <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  {statusLabel(item.status)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
