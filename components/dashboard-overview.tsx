import { ActivityPages } from "@/components/activity-pages";
import { localizeError } from "@/lib/i18n/errors";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import type { JobProgress, ChosenJob } from "@/lib/jobs";
import { formatMoney } from "@/lib/money";
import { loadWallet } from "@/lib/wallet";

type Activity = {
  id: string;
  at: string;
  kind: "job" | "message" | "chat" | "onboarding";
  title: string;
};

const tones: Record<JobProgress, string> = {
  processing: "#101820",
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
}: {
  jobs: readonly ChosenJob[];
  activity: readonly Activity[];
  error: string;
}) {
  const locale = await getLocale();
  const t = ui(locale);
  const wallet = await loadWallet();
  const payoutsMade = wallet.history
    .filter((entry) => entry.kind === "in")
    .reduce((total, entry) => total + entry.amountCents, 0);
  const payoutsPending = 0;
  const moneyTone = (cents: number) =>
    cents > 0
      ? "font-semibold text-[#22c55e] [text-shadow:0_0_8px_#22c55e,0_0_18px_rgba(34,197,94,0.85)]"
      : "text-muted";
  const moneyCards = [
    { label: t.walletBalance, cents: wallet.balanceCents, tone: "#f5c400" },
    { label: t.payoutsPending, cents: payoutsPending, tone: "#6b7280" },
    { label: t.payoutsMade, cents: payoutsMade, tone: "#22c55e" },
  ];
  const processing = jobs.filter((job) => job.status === "processing").length;
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
    <section className="mt-10">
      <h2 className="font-display text-2xl font-bold uppercase tracking-wide">{t.overview}</h2>
      {wallet.error ? (
        <p className="mt-4 text-muted">{localizeError(locale, wallet.error)}</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {moneyCards.map((card) => (
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
      )}
      {error ? (
        <p className="mt-4 text-muted">{error}</p>
      ) : (
        <>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {cards.map((card) => (
              <li key={card.label} className="border-t-4 bg-white p-6" style={{ borderColor: card.tone }}>
                <p className="font-display text-4xl font-bold">{card.value}</p>
                <p className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">
                  {card.label}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-4 grid gap-4 lg:grid-cols-[16rem_1fr]">
            <div className="flex items-center gap-5 bg-white p-6">
              <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0" role="img" aria-label={`${percent}%`}>
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
                <p className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">
                  {t.jobProgressLabel}
                </p>
                <p className="mt-2 font-display text-3xl font-bold">{percent}%</p>
                <p className="mt-1 text-sm text-muted">
                  {done} / {total}
                </p>
              </div>
            </div>

            <div className="bg-white p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">
                  {t.performance}
                </h3>
                <p className="text-sm text-muted">{t.last7Days}</p>
              </div>
              <div className="mt-6 flex h-36 items-end gap-3">
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
