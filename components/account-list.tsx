"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";
import { deleteDeniedAccount } from "@/app/admin/review-actions";
import { loadAccountDetails, verifyJobAction, type AccountDetails } from "@/app/dashboard/team/actions";
import { JobPace } from "@/components/job-facts";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import type { Locale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { timerTotalSeconds } from "@/lib/job-timer";
import { formatMoney } from "@/lib/money";

type AccountRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  role: string;
  stars: number;
  createdAt: string;
};

function roleName(role: string, t: ReturnType<typeof ui>) {
  if (role === "admin") return t.roleAdmin;
  if (role === "agent") return t.roleAgent;
  if (role === "team") return t.roleTeam;
  if (role === "member") return t.roleMember;
  return t.roleAffiliate;
}

const roleTones: Record<string, string> = {
  admin: "bg-[#fff3c4] text-[#7a5b10]",
  team: "bg-[#efe4ff] text-[#5c3d8a]",
  agent: "bg-[#dceaff] text-[#2c4d86]",
  affiliate: "bg-[#d9f5e5] text-[#1d6a42]",
  member: "bg-[#eef1f4] text-[#4b5563]",
};

function RoleTag({ role, label }: { role: string; label: string }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 font-display text-xs font-semibold uppercase tracking-wider ${roleTones[role] ?? roleTones.member}`}
    >
      {label}
    </span>
  );
}

function statusName(status: string, t: ReturnType<typeof ui>) {
  if (status === "approved") return t.statusApproved;
  if (status === "denied") return t.statusDenied;
  return t.statusPending;
}

function progressName(status: string, t: ReturnType<typeof ui>) {
  if (status === "done") return t.jobDone;
  if (status === "review") return t.jobReview;
  if (status === "incomplete") return t.jobIncomplete;
  return t.jobProcessing;
}

function formatClock(value: number) {
  const safe = Math.max(0, Math.floor(value));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function TrueTimer({
  seconds,
  startedAt,
  running,
}: {
  seconds: number;
  startedAt: string;
  running: boolean;
}) {
  const [shown, setShown] = useState(timerTotalSeconds(seconds, running ? startedAt : ""));

  useEffect(() => {
    const tick = () => setShown(timerTotalSeconds(seconds, running ? startedAt : ""));
    tick();
    if (!running) return;
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [running, seconds, startedAt]);

  return <>{formatClock(shown)}</>;
}

function MemberJobPace({
  job,
  locale,
}: {
  job: {
    startsOn: string;
    expiresOn: string;
    status: string;
    timerElapsedSeconds: number;
    timerStartedAt: string;
    timerRunning: boolean;
  };
  locale: Locale;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!job.timerRunning) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [job.timerRunning]);

  const status =
    job.status === "done" || job.status === "incomplete" || job.status === "review" ? job.status : "processing";

  return (
    <div className="mt-2 max-w-md">
      <JobPace
        startsOn={job.startsOn}
        expiresOn={job.expiresOn}
        elapsed={job.timerElapsedSeconds}
        startedAt={job.timerRunning ? job.timerStartedAt : ""}
        status={status}
        now={now}
        locale={locale}
      />
    </div>
  );
}

function levelName(level: string, t: ReturnType<typeof ui>) {
  if (level === "expert") return t.levelExpert;
  if (level === "intermediate") return t.levelIntermediate;
  return t.levelBeginner;
}

function Stars({ value }: { value: number }) {
  const lit = Math.max(0, Math.min(5, Math.floor(value)));
  return (
    <div className="inline-flex items-center gap-1" aria-label={`${lit} of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const active = index < lit;
        return (
          <span
            key={index}
            aria-hidden="true"
            className={active ? "text-accent" : "text-[#c6c9cf]"}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

export function AccountList({ accounts }: { accounts: AccountRow[] }) {
  const locale = useLocale();
  const t = ui(locale);
  const [selected, setSelected] = useState<AccountRow | null>(null);

  return (
    <>
      <ul>
        {accounts.map((item) => (
          <li key={item.id} className="flex items-stretch border-b border-line bg-white even:bg-canvas last:border-0">
            <button
              type="button"
              onClick={() => setSelected(item)}
              className="min-w-0 flex-1 px-6 py-5 text-left hover:bg-[#e8eaed]"
            >
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-display text-lg font-semibold uppercase tracking-wide">{item.name}</p>
                <RoleTag role={item.role} label={roleName(item.role, t)} />
                <Stars value={item.stars} />
              </div>
              <p className="mt-2 text-sm text-muted">
                {item.email}
                {item.phone ? ` · ${item.phone}` : ""}
                {" · "}
                {statusName(item.status, t)}
              </p>
            </button>
            {item.status === "denied" ? (
              <DeniedDelete
                id={item.id}
                onDeleted={() => {
                  if (selected?.id === item.id) setSelected(null);
                }}
              />
            ) : null}
          </li>
        ))}
      </ul>
      {selected ? <AccountOverlay account={selected} onClose={() => setSelected(null)} /> : null}
    </>
  );
}

function DeniedDelete({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const locale = useLocale();
  const t = ui(locale);
  const router = useRouter();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending]);

  function confirm() {
    setError("");
    start(async () => {
      const result = await deleteDeniedAccount(id);
      if (result.error) {
        setError(localizeError(locale, result.error));
        return;
      }
      setOpen(false);
      onDeleted();
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label={t.deleteAccount}
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="inline-flex w-14 shrink-0 items-center justify-center text-[#c4322a] hover:bg-[#fde8e6]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4 7h16" />
          <path d="M9 7V5h6v2" />
          <path d="M8 7l1 12h6l1-12" />
        </svg>
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget && !pending) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md border border-line bg-white p-6 shadow-[0_24px_60px_rgba(16,24,32,0.2)]"
          >
            <h2 id={titleId} className="font-display text-2xl font-bold uppercase tracking-wide">
              {t.deleteAccount}
            </h2>
            <p className="mt-4 leading-relaxed">{t.deleteAccountWarning}</p>
            {error ? (
              <p role="alert" className="mt-4 border-l-4 border-accent pl-3 text-sm">
                {error}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="border border-ink px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-canvas disabled:opacity-60"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={confirm}
                className="bg-[#c4322a] px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a82822] disabled:opacity-60"
              >
                {pending ? t.pleaseWait : t.deleteAccount}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function AccountOverlay({ account, onClose }: { account: AccountRow; onClose: () => void }) {
  const locale = useLocale();
  const t = ui(locale);
  const titleId = useId();
  const [details, setDetails] = useState<AccountDetails | null>(null);
  const [verifyError, setVerifyError] = useState("");
  const when = new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(account.createdAt));

  useEffect(() => {
    let live = true;
    loadAccountDetails(account.id).then((result) => {
      if (live) setDetails(result);
    });
    return () => {
      live = false;
    };
  }, [account.id]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-16"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-lg bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <h2 id={titleId} className="font-display text-2xl font-bold uppercase tracking-wide">
            {account.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted hover:text-foreground"
          >
            {t.close}
          </button>
        </div>
        <dl className="grid gap-5 px-6 py-6 sm:grid-cols-2">
          <Detail label={t.email} value={account.email} />
          <Detail label={t.phone} value={account.phone || "—"} />
          <div>
            <dt className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t.role}</dt>
            <dd className="mt-2">
              <RoleTag role={account.role} label={roleName(account.role, t)} />
            </dd>
          </div>
          <Detail label={t.status} value={statusName(account.status, t)} />
          <Detail label={t.joined} value={when} />
          <Detail
            label={t.balance}
            value={details ? formatMoney(details.balanceCents, locale) : t.pleaseWait}
            tone={details ? (details.balanceCents > 0 ? "glow" : "zero") : undefined}
          />
          <Detail
            label={t.made}
            value={details ? formatMoney(details.earnedCents, locale) : t.pleaseWait}
            tone={details ? (details.earnedCents > 0 ? "glow" : "zero") : undefined}
          />
          <Detail
            label={t.points}
            value={details ? String(details.points) : t.pleaseWait}
          />
          <Detail
            label={t.stars}
            value={details ? "★".repeat(details.stars) || "—" : t.pleaseWait}
          />
          <Detail
            label={t.level}
            value={details ? levelName(details.level, t) : t.pleaseWait}
          />
        </dl>
        {details?.error ? (
          <p className="border-t border-line px-6 py-5 text-sm text-muted">
            {localizeError(locale, details.error)}
          </p>
        ) : (
          <>
            <div className="border-t border-line px-6 py-5">
              <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">
                {locale === "es" ? "Trabajos activos" : "Active jobs"}
              </h3>
              {!details ? (
                <p className="mt-3 text-sm text-muted">{t.pleaseWait}</p>
              ) : details.jobs.length === 0 ? (
                <p className="mt-3 text-sm text-muted">{t.noSelectedJobs}</p>
              ) : (
                <ul className="mt-3">
                  {[...details.jobs]
                    .sort((a, b) => Number(b.status === "processing" || b.status === "review") - Number(a.status === "processing" || a.status === "review"))
                    .map((job) => {
                      const active = job.status === "processing";
                      const when = job.startsOn
                        ? new Date(`${job.startsOn}T12:00:00Z`).toLocaleDateString(locale === "es" ? "es-US" : "en-US", {
                            dateStyle: "medium",
                            timeZone: "UTC",
                          })
                        : "";
                      return (
                        <li key={job.id} className="border-b border-line py-3 last:border-0">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <p className="font-display font-semibold uppercase tracking-wide">{job.title}</p>
                            <p className="font-display text-sm font-bold [font-variant-numeric:tabular-nums]">
                              {job.payCents > 0 ? formatMoney(job.payCents, locale) : "—"}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-muted">
                            {job.pay === "weekly" ? t.payWeekly : t.payBiweekly}
                            {" · "}
                            {progressName(job.status, t)}
                            {when ? ` · ${locale === "es" ? "Inicia" : "Begins"} ${when}` : ""}
                          </p>
                          <p className="mt-1 font-display text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                            {locale === "es" ? "Tiempo real" : "True time"}{" "}
                            <TrueTimer
                              seconds={job.timerElapsedSeconds}
                              startedAt={job.timerStartedAt}
                              running={job.timerRunning}
                            />
                            {" · "}
                            <span className={job.timerRunning ? "text-[#0f766e]" : "text-muted"}>
                              {job.timerRunning
                                ? locale === "es"
                                  ? "En curso"
                                  : "Running"
                                : active
                                  ? locale === "es"
                                    ? "Detenido"
                                    : "Stopped"
                                  : locale === "es"
                                    ? "Cerrado"
                                    : "Closed"}
                            </span>
                          </p>
                          <MemberJobPace job={job} locale={locale} />
                          {job.status === "review" ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {(["done", "incomplete"] as const).map((next) => (
                                <button
                                  key={next}
                                  type="button"
                                  onClick={async () => {
                                    const data = new FormData();
                                    data.set("userId", account.id);
                                    data.set("jobId", job.jobId);
                                    data.set("status", next);
                                    const result = await verifyJobAction(data);
                                    if (result.error) {
                                      setVerifyError(result.error);
                                      return;
                                    }
                                    setVerifyError("");
                                    setDetails((current) =>
                                      current
                                        ? {
                                            ...current,
                                            jobs: current.jobs.map((item) =>
                                              item.jobId === job.jobId
                                                ? { ...item, status: next, timerRunning: false }
                                                : item,
                                            ),
                                          }
                                        : current,
                                    );
                                  }}
                                  className={
                                    next === "done"
                                      ? "inline-flex h-8 items-center border border-[#0f766e] bg-[#dcfce7] px-2.5 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0f766e] hover:bg-[#bbf7d0]"
                                      : "inline-flex h-8 items-center border border-[#9f1239] bg-[#ffe4e6] px-2.5 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9f1239] hover:bg-[#fecdd3]"
                                  }
                                >
                                  {next === "done" ? t.verifyFinished : t.verifyUnfinished}
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                </ul>
              )}
              {verifyError ? (
                <p className="mt-3 text-sm text-muted">{localizeError(locale, verifyError)}</p>
              ) : null}
            </div>
            <div className="border-t border-line px-6 py-5">
              <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">{t.onboarding}</h3>
              {!details ? (
                <p className="mt-3 text-sm text-muted">{t.pleaseWait}</p>
              ) : details.forms.length === 0 ? (
                <p className="mt-3 text-sm text-muted">{t.noForms}</p>
              ) : (
                <ul className="mt-3">
                  {details.forms.map((form) => (
                    <li key={form.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                      <p>{form.program}</p>
                      <p className="text-sm text-muted">{statusName(form.status, t)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Detail({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "glow" | "zero";
}) {
  const valueClass =
    tone === "glow"
      ? "font-semibold text-[#22c55e]"
      : tone === "zero"
        ? "text-muted"
        : "";
  return (
    <div>
      <dt className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className={`mt-2 ${valueClass}`}>{value}</dd>
    </div>
  );
}
