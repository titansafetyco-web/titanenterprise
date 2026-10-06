import { localizeError } from "@/lib/i18n/errors";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import type { JobPay, JobProgress, JobSelection } from "@/lib/jobs";
import { formatMoney } from "@/lib/money";

type AnalyticsUser = {
  id: string;
  name: string;
  role: string;
  status: string;
  selected: number;
  done: number;
  madeCents: number;
};

type AnalyticsJob = {
  id: string;
  title: string;
  pay: JobPay;
  processing: number;
  done: number;
  incomplete: number;
};

type ActivityKind = "job" | "message" | "chat" | "onboarding";

const statusTone: Record<JobProgress, string> = {
  processing: "bg-foreground",
  done: "bg-accent",
  incomplete: "bg-muted",
};

const kindTone: Record<ActivityKind, string> = {
  job: "bg-foreground",
  message: "bg-accent",
  chat: "bg-muted",
  onboarding: "bg-[#22c55e]",
};

function dayKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function lastDays() {
  const now = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (6 - index)));
    return day.toISOString().slice(0, 10);
  });
}

function moneyTone(cents: number) {
  return cents > 0
    ? "font-semibold text-[#22c55e] [text-shadow:0_0_8px_#22c55e,0_0_18px_rgba(34,197,94,0.85)]"
    : "text-muted";
}

function Bar({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const width = total === 0 ? 0 : (value / total) * 100;
  return (
    <li>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
        <p className="font-display text-lg font-bold">{value}</p>
      </div>
      <div className="mt-2 h-2 bg-canvas">
        <div className={`h-2 ${tone}`} style={{ width: `${width}%` }} />
      </div>
    </li>
  );
}

export async function DashboardAnalytics({
  users,
  jobs,
  selections,
  forms,
  messages,
  chats,
  activity,
  balanceCents,
  payoutsMade,
  errors,
}: {
  users: readonly AnalyticsUser[];
  jobs: readonly AnalyticsJob[];
  selections: readonly JobSelection[];
  forms: { pending: number; approved: number; denied: number };
  messages: number;
  chats: number;
  activity: readonly { at: string; kind: ActivityKind }[];
  balanceCents: number;
  payoutsMade: number;
  errors: readonly string[];
}) {
  const locale = await getLocale();
  const t = ui(locale);
  const roleName = (role: string) => {
    if (role === "admin") return t.roleAdmin;
    if (role === "agent") return t.roleAgent;
    if (role === "team") return t.roleTeam;
    if (role === "member") return t.roleMember;
    return t.roleAffiliate;
  };
  const accountStatus = (status: string) => {
    if (status === "approved") return t.statusApproved;
    if (status === "denied") return t.statusDenied;
    return t.statusPending;
  };
  const processing = selections.filter((item) => item.status === "processing").length;
  const done = selections.filter((item) => item.status === "done").length;
  const incomplete = selections.filter((item) => item.status === "incomplete").length;
  const selected = processing + done + incomplete;
  const percent = selected === 0 ? 0 : Math.round((done / selected) * 100);
  const weekly = selections.filter((item) => item.pay === "weekly").length;
  const biweekly = selections.filter((item) => item.pay === "biweekly").length;
  const roleRows = [
    { label: t.roleAdmin, value: users.filter((person) => person.role === "admin").length },
    { label: t.roleAgent, value: users.filter((person) => person.role === "agent").length },
    { label: t.roleAffiliate, value: users.filter((person) => person.role === "affiliate").length },
    { label: t.roleTeam, value: users.filter((person) => person.role === "team").length },
    { label: t.roleMember, value: users.filter((person) => person.role === "member").length },
  ];
  const statusRows = [
    { label: t.statusApproved, value: users.filter((person) => person.status === "approved").length, tone: "bg-[#22c55e]" },
    { label: t.statusPending, value: users.filter((person) => person.status === "pending").length, tone: "bg-accent" },
    { label: t.statusDenied, value: users.filter((person) => person.status === "denied").length, tone: "bg-muted" },
  ];
  const formTotal = forms.pending + forms.approved + forms.denied;
  const days = lastDays();
  const kinds: ActivityKind[] = ["job", "message", "chat", "onboarding"];
  const dayCounts = days.map((day) => {
    const items = activity.filter((item) => dayKey(item.at) === day);
    return {
      day,
      total: items.length,
      parts: kinds.map((kind) => items.filter((item) => item.kind === kind).length),
    };
  });
  const peak = Math.max(1, ...dayCounts.map((day) => day.total));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const held = selected === 0 ? 0 : (done / selected) * circumference;
  const summary = [
    { label: t.accounts, value: String(users.length), tone: "#101820" },
    { label: t.selectedJobs, value: String(selected), tone: "#f5c400" },
    { label: t.forms, value: String(formTotal), tone: "#6b7280" },
    { label: t.messages, value: String(messages), tone: "#22c55e" },
  ];

  return (
    <section className="bg-white">
      <div className="border-b border-line px-6 py-5">
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide">{t.analytics}</h2>
      </div>
      {errors.length > 0 ? (
        <div className="border-b border-line px-6 py-4">
          {errors.map((error) => (
            <p key={error} className="text-sm text-muted">
              {localizeError(locale, error)}
            </p>
          ))}
        </div>
      ) : null}

      <ul className="grid grid-cols-2 gap-4 bg-canvas p-6 lg:grid-cols-4">
        {summary.map((card) => (
          <li key={card.label} className="border-t-4 bg-white p-6" style={{ borderColor: card.tone }}>
            <p className="font-display text-4xl font-bold">{card.value}</p>
            <p className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">
              {card.label}
            </p>
          </li>
        ))}
      </ul>

      <div className="border-t border-line px-4 py-5 md:px-6 md:py-6">
        <h3 className="font-display text-lg font-semibold uppercase tracking-wide">{t.userPerformance}</h3>
        <div className="mt-5 grid gap-5 md:mt-6 md:gap-8 lg:grid-cols-2">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t.roles}</p>
            <ul className="mt-3 space-y-3 md:mt-4 md:space-y-4">
              {roleRows.map((row) => (
                <Bar key={row.label} label={row.label} value={row.value} total={users.length} tone="bg-foreground" />
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t.status}</p>
            <ul className="mt-3 space-y-3 md:mt-4 md:space-y-4">
              {statusRows.map((row) => (
                <Bar key={row.label} label={row.label} value={row.value} total={users.length} tone={row.tone} />
              ))}
            </ul>
          </div>
        </div>
        {users.length === 0 ? (
          <p className="mt-6 text-muted">{t.noAccounts}</p>
        ) : (
          <>
            <ul className="mt-5 grid gap-3 lg:hidden">
              {users.map((person) => {
                const share = person.selected === 0 ? 0 : Math.round((person.done / person.selected) * 100);
                return (
                  <li key={person.id} className="border border-line bg-canvas p-4">
                    <p className="font-display font-semibold uppercase tracking-wide">{person.name}</p>
                    <p className="mt-2 text-sm text-muted">
                      {t.roles}: {roleName(person.role)}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {t.status}: {accountStatus(person.status)}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {t.jobProgressLabel}: {person.done} / {person.selected} ({share}%)
                    </p>
                    <p className={`mt-2 font-display text-sm ${moneyTone(person.madeCents)}`}>
                      {t.payoutsMade}: {formatMoney(person.madeCents, locale)}
                    </p>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 hidden overflow-x-auto border border-line lg:block">
            <table className="w-full min-w-[40rem] text-left">
              <thead>
                <tr className="border-b border-line font-display text-xs uppercase tracking-[0.14em] text-muted">
                  <th className="px-4 py-3 font-semibold">{t.name}</th>
                  <th className="px-4 py-3 font-semibold">{t.roles}</th>
                  <th className="px-4 py-3 font-semibold">{t.status}</th>
                  <th className="px-4 py-3 font-semibold">{t.jobProgressLabel}</th>
                  <th className="px-4 py-3 font-semibold">{t.payoutsMade}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((person) => {
                  const share = person.selected === 0 ? 0 : Math.round((person.done / person.selected) * 100);
                  return (
                    <tr key={person.id} className="border-b border-line last:border-0 even:bg-canvas">
                      <td className="px-4 py-4 font-display font-semibold uppercase tracking-wide">{person.name}</td>
                      <td className="px-4 py-4 text-sm">{roleName(person.role)}</td>
                      <td className="px-4 py-4 text-sm">{accountStatus(person.status)}</td>
                      <td className="px-4 py-4 text-sm">
                        {person.done} / {person.selected}
                        <span className="ml-2 text-muted">{share}%</span>
                      </td>
                      <td className={`px-4 py-4 font-display ${moneyTone(person.madeCents)}`}>
                        {formatMoney(person.madeCents, locale)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>

      <div className="border-t border-line px-6 py-6">
        <h3 className="font-display text-lg font-semibold uppercase tracking-wide">{t.jobPerformance}</h3>
        <div className="mt-6 grid gap-8 lg:grid-cols-[16rem_1fr]">
          <div className="flex items-center gap-5">
            <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0" role="img" aria-label={`${percent}%`}>
              <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
              {held > 0 ? (
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="#f5c400"
                  strokeWidth="12"
                  strokeDasharray={`${held} ${circumference - held}`}
                  transform="rotate(-90 60 60)"
                />
              ) : null}
              <text x="60" y="64" textAnchor="middle" className="fill-foreground font-display text-[16px] font-bold">
                {percent}%
              </text>
            </svg>
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">
                {t.jobProgressLabel}
              </p>
              <p className="mt-2 font-display text-3xl font-bold">{percent}%</p>
              <p className="mt-1 text-sm text-muted">
                {done} / {selected}
              </p>
            </div>
          </div>
          <ul className="space-y-4">
            <Bar label={t.jobProcessing} value={processing} total={selected} tone={statusTone.processing} />
            <Bar label={t.jobDone} value={done} total={selected} tone={statusTone.done} />
            <Bar label={t.jobIncomplete} value={incomplete} total={selected} tone={statusTone.incomplete} />
            <Bar label={t.payWeekly} value={weekly} total={selected} tone="bg-foreground" />
            <Bar label={t.payBiweekly} value={biweekly} total={selected} tone="bg-accent" />
          </ul>
        </div>
        <p className="mt-8 font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          {t.listed} {jobs.length}
        </p>
        {jobs.length === 0 ? (
          <p className="mt-4 text-muted">{t.noListedJobs}</p>
        ) : (
          <ul className="mt-4">
            {jobs.map((job) => {
              const total = job.processing + job.done + job.incomplete;
              const slices = [
                { key: "processing", value: job.processing, tone: statusTone.processing },
                { key: "done", value: job.done, tone: statusTone.done },
                { key: "incomplete", value: job.incomplete, tone: statusTone.incomplete },
              ];
              return (
                <li key={job.id} className="border-b border-line py-4 last:border-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="font-display font-semibold uppercase tracking-wide">{job.title}</p>
                    <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                      {job.pay === "weekly" ? t.payWeekly : t.payBiweekly}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {job.processing} {t.jobProcessing} · {job.done} {t.jobDone} · {job.incomplete} {t.jobIncomplete}
                  </p>
                  <div className="mt-3 flex h-2 bg-canvas">
                    {total === 0
                      ? null
                      : slices.map((slice) =>
                          slice.value === 0 ? null : (
                            <div
                              key={slice.key}
                              className={slice.tone}
                              style={{ width: `${(slice.value / total) * 100}%` }}
                            />
                          ),
                        )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="grid gap-8 border-t border-line px-6 py-6 lg:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">{t.activityMix}</h3>
            <p className="text-sm text-muted">{t.last7Days}</p>
          </div>
          <div className="mt-6 flex h-36 items-end gap-3">
            {dayCounts.map((day) => (
              <div key={day.day} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                <div
                  className="flex flex-col-reverse"
                  style={{ height: `${Math.max(day.total === 0 ? 4 : 8, (day.total / peak) * 100)}%` }}
                >
                  {day.total === 0 ? (
                    <div className="h-full bg-line" />
                  ) : (
                    day.parts.map((count, index) =>
                      count === 0 ? null : (
                        <div
                          key={kinds[index]}
                          className={kindTone[kinds[index]]}
                          style={{ height: `${(count / day.total) * 100}%` }}
                        />
                      ),
                    )
                  )}
                </div>
                <p className="mt-2 truncate text-center text-[11px] uppercase tracking-wide text-muted">
                  {new Date(`${day.day}T12:00:00Z`).toLocaleDateString(locale === "es" ? "es-US" : "en-US", {
                    weekday: "short",
                  })}
                </p>
              </div>
            ))}
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
            <li className="inline-flex items-center gap-2">
              <span className="size-2 bg-foreground" />
              {t.selectedJobs}
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="size-2 bg-accent" />
              {t.messages}
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="size-2 bg-muted" />
              {t.chat}
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="size-2 bg-[#22c55e]" />
              {t.onboarding}
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">{t.onboarding}</h3>
          <ul className="mt-6 space-y-4">
            <Bar label={t.statusPending} value={forms.pending} total={formTotal} tone="bg-accent" />
            <Bar label={t.statusApproved} value={forms.approved} total={formTotal} tone="bg-[#22c55e]" />
            <Bar label={t.statusDenied} value={forms.denied} total={formTotal} tone="bg-muted" />
          </ul>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="border border-line p-4">
              <p className="font-display text-2xl font-bold">{messages}</p>
              <p className="mt-1 font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {t.messages}
              </p>
            </div>
            <div className="border border-line p-4">
              <p className="font-display text-2xl font-bold">{chats}</p>
              <p className="mt-1 font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {t.chatNotes}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <ul className="grid gap-4 bg-canvas p-6 sm:grid-cols-2">
          <li className="border-t-4 border-[#f5c400] bg-white p-6">
            <p className={`font-display text-4xl font-bold ${moneyTone(balanceCents)}`}>
              {formatMoney(balanceCents, locale)}
            </p>
            <p className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">
              {t.balancesOnRecord}
            </p>
          </li>
          <li className="border-t-4 border-[#22c55e] bg-white p-6">
            <p className={`font-display text-4xl font-bold ${moneyTone(payoutsMade)}`}>
              {formatMoney(payoutsMade, locale)}
            </p>
            <p className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">
              {t.payoutsMade}
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
