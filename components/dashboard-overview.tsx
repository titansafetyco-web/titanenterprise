import Link from "next/link";
import { ActivityPages } from "@/components/activity-pages";
import { localizeError } from "@/lib/i18n/errors";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import type { JobProgress, ChosenJob } from "@/lib/jobs";
import { formatMoney } from "@/lib/money";
import { listOwnPayouts, loadWallet } from "@/lib/wallet";

type Activity = {
  id: string;
  at: string;
  kind: "job" | "message" | "chat" | "onboarding";
  title: string;
};

const tones: Record<JobProgress, string> = {
  processing: "#101820",
  review: "#7a5b00",
  done: "#f5c400",
  incomplete: "#6b7280",
};

function dayKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function lastDays() {
  const now = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (6 - index)),
    );
    return day.toISOString().slice(0, 10);
  });
}

export async function DashboardOverview({
  jobs,
  activity,
  error,
  memberCount,
}: {
  jobs: readonly ChosenJob[];
  activity: readonly Activity[];
  error: string;
  memberCount: number | null;
}) {
  const locale = await getLocale();
  const t = ui(locale);
  const wallet = await loadWallet();
  const payouts = await listOwnPayouts();
  const payoutsMade = wallet.history
    .filter((entry) => entry.kind === "in")
    .reduce((total, entry) => total + entry.amountCents, 0);
  const payoutsPending = payouts.items
    .filter((item) => item.status === "pending")
    .reduce((total, item) => total + item.amountCents, 0);
  const moneyTone = (cents: number) =>
    cents > 0
      ? "font-semibold text-[#22c55e]"
      : "text-muted";
  const moneyCards = [
    { label: t.walletBalance, cents: wallet.balanceCents, tone: "#f5c400" },
    { label: t.payoutsPending, cents: payoutsPending, tone: "#6b7280" },
    { label: t.payoutsMade, cents: payoutsMade, tone: "#22c55e" },
  ];
  const processing = jobs.filter((job) => job.status === "processing" || job.status === "review").length;
  const done = jobs.filter((job) => job.status === "done").length;
  const incomplete = jobs.filter((job) => job.status === "incomplete").length;
  const total = processing + done + incomplete;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const cards = [
    { label: t.jobProcessing, value: processing, tone: tones.processing },
    { label: t.jobDone, value: done, tone: tones.done },
    { label: t.jobIncomplete, value: incomplete, tone: tones.incomplete },
  ];
  const days = lastDays();
  const counts = days.map(
    (day) => activity.filter((item) => dayKey(item.at) === day).length,
  );
  const peak = Math.max(1, ...counts);
  const recent = [...activity].sort((a, b) => +new Date(b.at) - +new Date(a.at));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const slices = (
    [
      ["processing", processing],
      ["done", done],
      ["incomplete", incomplete],
    ] as const
  ).filter(([, value]) => value > 0);

  return (
    <section className="mt-6 md:mt-10">
      <h2 className="font-display text-xl font-bold uppercase tracking-wide md:text-2xl">{t.overview}</h2>
      {wallet.error ? (
        <p className="mt-4 text-muted">{localizeError(locale, wallet.error)}</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4">
          {moneyCards.map((card) => (
            <li key={card.label} className="border-t-4 bg-white p-4 sm:p-6" style={{ borderColor: card.tone }}>
              <p className={`font-display text-2xl font-bold sm:text-4xl ${moneyTone(card.cents)}`}>
                {formatMoney(card.cents, locale)}
              </p>
              <p className="mt-1 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-muted sm:mt-2 sm:text-sm">
                {card.label}
              </p>
            </li>
          ))}
        </ul>
      )}
      {error ? (
        <p className="mt-4 text-muted">{error}</p>
      ) : (
        <>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {cards.map((card) => (
              <li key={card.label} className="border-t-4 bg-white p-4 sm:p-6" style={{ borderColor: card.tone }}>
                <p className="font-display text-2xl font-bold sm:text-4xl">{card.value}</p>
                <p className="mt-1 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-muted sm:mt-2 sm:text-sm">
                  {card.label}
                </p>
              </li>
            ))}
            {memberCount !== null ? (
              <li className="border-t-4 bg-white" style={{ borderColor: "#2c4d86" }}>
                <Link href="/dashboard/team" className="block p-4 hover:bg-[#e8eaed] sm:p-6">
                  <p className="font-display text-2xl font-bold sm:text-4xl">{memberCount}</p>
                  <p className="mt-1 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-muted sm:mt-2 sm:text-sm">
                    {t.members}
                  </p>
                </Link>
              </li>
            ) : null}
          </ul>

          <div className="mt-4 grid gap-3 sm:gap-4 lg:grid-cols-[16rem_1fr]">
            <div className="flex items-center gap-4 bg-white p-4 sm:gap-5 sm:p-6">
              <svg viewBox="0 0 120 120" className="h-24 w-24 shrink-0 sm:h-28 sm:w-28" role="img" aria-label={`${percent}%`}>
                <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
                {slices.map(([key, value]) => {
                  const length = (value / total) * circumference;
                  const dash = `${length} ${circumference - length}`;
                  const sliceOffset = offset;
                  offset += length;
                  return (
                    <circle
                      key={key}
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="none"
                      stroke={tones[key]}
                      strokeWidth="12"
                      strokeDasharray={dash}
                      strokeDashoffset={-sliceOffset}
                      transform="rotate(-90 60 60)"
                    />
                  );
                })}
                <text
                  x="60"
                  y="64"
                  textAnchor="middle"
                  className="fill-foreground font-display text-[18px] font-bold"
                >
                  {percent}%
                </text>
              </svg>
              <div>
                <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted sm:text-sm">
                  {t.jobProgressLabel}
                </p>
                <p className="mt-1 font-display text-2xl font-bold sm:mt-2 sm:text-3xl">{percent}%</p>
                <p className="mt-1 text-xs text-muted sm:text-sm">
                  {done} / {total}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-xs font-semibold uppercase tracking-[0.14em] sm:text-sm">
                  {t.performance}
                </h3>
                <p className="text-xs text-muted sm:text-sm">{t.last7Days}</p>
              </div>
              <div className="mt-4 flex h-28 items-end gap-2 sm:mt-6 sm:h-36 sm:gap-3">
                {days.map((day, index) => (
                  <div key={day} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                    <div
                      className="bg-accent"
                      style={{ height: `${Math.max(counts[index] === 0 ? 4 : 8, (counts[index] / peak) * 100)}%` }}
                    />
                    <p className="mt-2 truncate text-center text-[11px] uppercase tracking-wide text-muted">
                      {new Date(`${day}T12:00:00Z`).toLocaleDateString(locale === "es" ? "es" : "en-US", {
                        weekday: "short",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ActivityPages items={recent} />
        </>
      )}
    </section>
  );
}
