"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useRef, useState, useTransition, type ReactNode } from "react";
import { addFundsAction, connectBankAction, connectBrokerAction, saveCryptoWalletAction, sendAchAction, sendCryptoAction, transferAction, type WalletState } from "@/app/dashboard/wallet/actions";
import type { CryptoHolding } from "@/lib/payouts";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";
import { formatMoney, type WalletEntry, type WalletRecipient } from "@/lib/money";

const initialState: WalletState = { error: "" };

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

function sumKind(history: WalletEntry[], kind: WalletEntry["kind"]) {
  return history.filter((entry) => entry.kind === kind).reduce((total, entry) => total + entry.amountCents, 0);
}

function roleLabel(role: string, t: ReturnType<typeof ui>) {
  if (role === "admin") return t.roleAdmin;
  if (role === "agent") return t.roleAgent;
  if (role === "team") return t.roleTeam;
  if (role === "member") return t.roleMember;
  return t.roleAffiliate;
}

function transferRail(process: string, portal: string, t: ReturnType<typeof ui>) {
  const processLabel = process === "pending" ? t.processPending : process === "payment" ? t.processPayment : "";
  const portals: Record<string, string> = {
    wire: t.portalWire,
    ach: t.portalAch,
    zelle: t.portalZelle,
    venmo: t.portalVenmo,
    cashapp: t.portalCashapp,
    paypal: t.portalPaypal,
    crypto: t.portalCrypto,
    deposit: t.portalDeposit,
  };
  const detail = [processLabel, portals[portal] ?? ""].filter(Boolean).join(" · ");
  return detail ? ` · ${detail}` : "";
}

function MoneyForm({
  action,
  title,
  submit,
  children,
}: {
  action: (state: WalletState, formData: FormData) => Promise<WalletState>;
  title: string;
  submit: string;
  children: ReactNode;
}) {
  const locale = useLocale();
  const t = ui(locale);
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialState);
  const wasPending = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      formRef.current?.reset();
      router.refresh();
    }
    wasPending.current = pending;
  }, [pending, router, state.error]);

  return (
    <form ref={formRef} action={formAction} className="flex h-full flex-col border border-[#e6d7c3] bg-[#fffaf3]">
      <h2 className="border-b border-[#e6d7c3] px-6 py-4 font-display text-sm font-semibold uppercase tracking-[0.16em]">
        {title}
      </h2>
      <div className="flex flex-1 flex-col gap-5 px-6 py-5">
        {children}
        {state.error ? (
          <p role="alert" className="border-l-4 border-accent pl-3 text-sm">
            {localizeError(locale, state.error)}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-auto w-fit bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400] disabled:opacity-60"
        >
          {pending ? t.pleaseWait : submit}
        </button>
      </div>
    </form>
  );
}

function AmountField({ label, field, hint }: { label: string; field: string; hint?: string }) {
  const locale = useLocale();
  const t = ui(locale);
  return (
    <label className="block">
      <span className={label}>{t.amount}</span>
      <span className="relative mt-2 block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6a3d]">$</span>
        <input name="amount" inputMode="decimal" required placeholder="0.00" className={field} />
      </span>
      {hint ? <span className="mt-2 block text-sm font-bold text-ink">{hint}</span> : null}
    </label>
  );
}

function ConnectBank({ ready }: { ready: boolean }) {
  const locale = useLocale();
  const t = ui(locale);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError("");
          start(async () => {
            const result = await connectBankAction();
            if (result) setError(localizeError(locale, result));
          });
        }}
        className="w-fit border border-[#c4a36a] px-4 py-2 font-display text-xs font-semibold uppercase tracking-wider text-ink hover:bg-[#f3eadc] disabled:opacity-60"
      >
        {pending ? t.pleaseWait : t.addBank}
      </button>
      {ready ? null : <p className="mt-2 text-sm text-[#8a6a3d]">{t.bankNeeded}</p>}
      {error ? (
        <p role="alert" className="mt-3 border-l-4 border-accent pl-3 text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function CryptoPortal({
  connected,
  holdings,
  address,
  label,
  field,
}: {
  connected: boolean;
  holdings: CryptoHolding[];
  address: string;
  label: string;
  field: string;
}) {
  const locale = useLocale();
  const t = ui(locale);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [state, formAction, saving] = useActionState(saveCryptoWalletAction, initialState);
  const wasSaving = useRef(false);

  useEffect(() => {
    if (wasSaving.current && !saving && !state.error) router.refresh();
    wasSaving.current = saving;
  }, [router, saving, state.error]);

  return (
    <section className="border border-[#e6d7c3] bg-[#fffaf3]">
      <div className={`flex flex-wrap items-center justify-between gap-3 px-6 py-4 ${open ? "border-b border-[#e6d7c3]" : ""}`}>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="text-left"
        >
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em]">{t.cryptoPayout}</h2>
          <p className="mt-1 text-sm text-[#8a6a3d]">
            {t.cryptoBroker} · {connected ? t.brokerConnected : t.brokerNotConnected}
          </p>
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setNote("");
            start(async () => {
              const result = await connectBrokerAction();
              if (result) {
                setNote(localizeError(locale, result));
                setOpen(true);
                return;
              }
              router.refresh();
            });
          }}
          className="bg-accent px-4 py-2 font-display text-xs font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400] disabled:opacity-60"
        >
          {pending ? t.pleaseWait : t.connectBroker}
        </button>
      </div>
      {open ? (
      <>
      <div className="border-b border-[#e6d7c3] px-6 py-4">
        <p className={label}>{t.cryptoBalance}</p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {holdings.map((item) => (
            <li key={item.asset}>
              <p className="font-display text-2xl font-bold">{connected && item.amount !== "" ? item.amount : "—"}</p>
              <p className="mt-1 font-display text-xs font-semibold uppercase tracking-[0.14em] text-[#8a6a3d]">{item.asset}</p>
            </li>
          ))}
        </ul>
      </div>
      <form action={formAction} className="flex flex-col gap-4 px-6 py-5">
        <label className="block">
          <span className={label}>{t.linkWallet}</span>
          <input name="address" defaultValue={address} autoComplete="off" placeholder={t.cryptoAddress} className={field} />
        </label>
        {note || state.error ? (
          <p role="alert" className="border-l-4 border-accent pl-3 text-sm">
            {note || localizeError(locale, state.error)}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={saving}
          className="w-fit border border-[#c4a36a] px-4 py-2 font-display text-xs font-semibold uppercase tracking-wider text-ink hover:bg-[#f3eadc] disabled:opacity-60"
        >
          {saving ? t.pleaseWait : t.saveWallet}
        </button>
      </form>
      </>
      ) : null}
    </section>
  );
}

function weekBounds(key: string) {
  const date = new Date(`${key}T12:00:00Z`);
  const start = new Date(date);
  start.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)] as const;
}

function monthBounds(key: string) {
  const date = new Date(`${key}T12:00:00Z`);
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
  return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)] as const;
}

function sumRange(history: WalletEntry[], start: string, end: string) {
  return history.reduce((total, entry) => {
    const key = dayKey(entry.createdAt);
    return key >= start && key <= end ? total + entry.amountCents : total;
  }, 0);
}

function PayCalendar({ history }: { history: WalletEntry[] }) {
  const locale = useLocale();
  const t = ui(locale);
  const titleId = useId();
  const today = new Date().toISOString().slice(0, 10);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(today);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getUTCFullYear(), month: now.getUTCMonth() };
  });

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const byDay = new Map<string, number>();
  for (const entry of history) {
    const key = dayKey(entry.createdAt);
    byDay.set(key, (byDay.get(key) ?? 0) + entry.amountCents);
  }
  const first = new Date(Date.UTC(cursor.year, cursor.month, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(cursor.year, cursor.month + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= count; day += 1) {
    cells.push(new Date(Date.UTC(cursor.year, cursor.month, day)).toISOString().slice(0, 10));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const [weekStart, weekEnd] = weekBounds(selected);
  const [monthStart, monthEnd] = monthBounds(selected);
  const periods = [
    { label: t.day, cents: byDay.get(selected) ?? 0 },
    { label: t.week, cents: sumRange(history, weekStart, weekEnd) },
    { label: t.month, cents: sumRange(history, monthStart, monthEnd) },
  ];
  const weekday = locale === "es" ? "es" : "en-US";

  return (
    <>
      <button
        type="button"
        aria-label={t.calendar}
        aria-pressed={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-[30px] w-[30px] items-center justify-center border border-[#c4a36a] text-ink hover:bg-[#f3eadc]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" />
          <path d="M3 10h18" />
          <path d="M8 3v4" />
          <path d="M16 3v4" />
        </svg>
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3a2a18]/45 p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-3xl border border-[#e6d7c3] bg-[#fffaf3] p-8 shadow-[0_24px_60px_rgba(90,60,20,0.18)]"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 id={titleId} className="font-display text-xl font-bold uppercase tracking-wide">
                {first.toLocaleDateString(weekday, { month: "long", year: "numeric", timeZone: "UTC" })}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="font-display text-xs font-semibold uppercase tracking-wider text-[#8a6a3d] hover:text-foreground"
              >
                {t.close}
              </button>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                aria-label={t.activityPrevious}
                onClick={() =>
                  setCursor((current) =>
                    current.month === 0
                      ? { year: current.year - 1, month: 11 }
                      : { year: current.year, month: current.month - 1 },
                  )
                }
                className="border border-[#e6d7c3] px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wider hover:bg-[#f3eadc]"
              >
                {t.activityPrevious}
              </button>
              <button
                type="button"
                aria-label={t.activityNext}
                onClick={() =>
                  setCursor((current) =>
                    current.month === 11
                      ? { year: current.year + 1, month: 0 }
                      : { year: current.year, month: current.month + 1 },
                  )
                }
                className="border border-[#e6d7c3] px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wider hover:bg-[#f3eadc]"
              >
                {t.activityNext}
              </button>
            </div>
            <div className="mt-6 grid grid-cols-7 gap-2 text-center font-display text-xs font-semibold uppercase tracking-wide text-[#8a6a3d]">
              {Array.from({ length: 7 }, (_, index) => (
                <p key={index}>
                  {new Date(Date.UTC(2024, 0, index + 1)).toLocaleDateString(weekday, {
                    weekday: "short",
                    timeZone: "UTC",
                  })}
                </p>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {cells.map((key, index) => {
                if (!key) return <span key={`empty-${index}`} />;
                const amount = byDay.get(key) ?? 0;
                const payDay = amount > 0;
                const active = key === selected;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelected(key)}
                    className={`flex h-20 flex-col items-center justify-center gap-1 font-display ${
                      payDay ? "bg-[#d9f5e5] text-[#1d6a42]" : "bg-[#f3eadc] text-foreground"
                    } ${active ? "ring-2 ring-accent" : ""}`}
                  >
                    <span className="text-base font-semibold">{Number(key.slice(8))}</span>
                    <span className={`text-xs font-semibold ${payDay ? "text-[#1d6a42]" : "text-[#8a6a3d]"}`}>
                      {formatMoney(amount, locale)}
                    </span>
                  </button>
                );
              })}
            </div>
            <ul className="mt-5 grid grid-cols-3 border border-[#e6d7c3]">
              {periods.map((period) => (
                <li key={period.label} className="border-r border-[#e6d7c3] px-3 py-3 last:border-r-0">
                  <p className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a6a3d]">
                    {period.label}
                  </p>
                  <p className="mt-1 font-display text-sm font-semibold">{formatMoney(period.cents, locale)}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-[#8a6a3d]">{t.consumed}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function WalletPanel({
  balanceCents,
  admin,
  bankReady,
  recipients,
  history,
  cryptoConnected,
  holdings,
  cryptoWallet,
}: {
  balanceCents: number;
  admin: boolean;
  bankReady: boolean;
  recipients: WalletRecipient[];
  history: WalletEntry[];
  cryptoConnected: boolean;
  holdings: CryptoHolding[];
  cryptoWallet: string;
}) {
  const locale = useLocale();
  const t = ui(locale);
  const field =
    "mt-2 w-full border border-[#e6d7c3] bg-[#fffaf3] px-3 py-3 text-foreground outline-none focus-visible:border-accent";
  const amountField =
    "w-full border border-[#e6d7c3] bg-[#fffaf3] py-3 pl-7 pr-3 text-foreground outline-none focus-visible:border-accent";
  const label = "font-display text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6a3d]";
  const received = sumKind(history, "in");
  const sent = sumKind(history, "out");
  const added = sumKind(history, "credit");
  const pending = history
    .filter((entry) => entry.process === "pending")
    .reduce((total, entry) => total + entry.amountCents, 0);
  const recorded = balanceCents + sent;
  const share = recorded === 0 ? 0 : Math.round((balanceCents / recorded) * 100);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const heldLength = recorded === 0 ? 0 : (balanceCents / recorded) * circumference;
  const days = lastDays();
  const totals = days.map((day) =>
    history.filter((entry) => dayKey(entry.createdAt) === day).reduce((total, entry) => total + entry.amountCents, 0),
  );
  const peak = Math.max(1, ...totals);
  const moneyTone = (cents: number) =>
    cents > 0
      ? "font-semibold text-[#22c55e] [text-shadow:0_0_8px_#22c55e,0_0_18px_rgba(34,197,94,0.85)]"
      : "text-[#8a6a3d]";
  const cards = [
    { label: t.walletReceived, cents: received },
    { label: t.walletSent, cents: sent },
    { label: t.walletAdded, cents: added },
    { label: t.processPending, cents: pending },
  ];

  const kindTag = {
    credit: "bg-[#fff3c4] text-[#7a5b10]",
    in: "bg-[#d9f5e5] text-[#1d6a42]",
    out: "bg-[#fde8e6] text-[#8a2e28]",
  };
  const kindLabel = {
    credit: t.walletAdded,
    in: t.walletReceived,
    out: t.walletSent,
  };

  return (
    <div className="grid gap-4 px-6 py-6">
      <section className="border border-[#e6d7c3] border-t-4 border-t-accent bg-[#fffaf3]">
        <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-6">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-ink">{t.balance}</p>
            <p className="mt-2 font-display text-5xl font-bold tracking-wide text-ink">
              {formatMoney(balanceCents, locale)}
            </p>
            <p className="mt-2 text-sm text-ink">{t.walletShare}</p>
          </div>
          {recorded > 0 ? (
            <svg viewBox="0 0 120 120" className="h-24 w-24 shrink-0" role="img" aria-label={`${share}%`}>
              <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#22c55e"
                strokeWidth="12"
                strokeDasharray={`${heldLength} ${circumference - heldLength}`}
                transform="rotate(-90 60 60)"
              />
              <text x="60" y="64" textAnchor="middle" className="fill-foreground font-display text-[16px] font-bold">
                {share}%
              </text>
            </svg>
          ) : null}
        </div>
        <ul className="grid border-t border-[#e6d7c3] sm:grid-cols-4">
          {cards.map((card) => (
            <li key={card.label} className="border-b border-[#e6d7c3] px-6 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
              <p className={label}>{card.label}</p>
              <p className={`mt-2 font-display text-2xl font-bold ${moneyTone(card.cents)}`}>
                {formatMoney(card.cents, locale)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border border-[#e6d7c3] bg-[#fffaf3] px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em]">{t.last7Days}</h2>
          <div className="flex items-center gap-3">
            <p className={`font-display text-sm font-semibold ${moneyTone(totals.reduce((total, value) => total + value, 0))}`}>
              {formatMoney(totals.reduce((total, value) => total + value, 0), locale)}
            </p>
            <PayCalendar history={history} />
          </div>
        </div>
        <div className="mt-6 flex h-28 items-end gap-2">
          {days.map((day, index) => (
            <div key={day} className="flex h-full min-w-0 flex-1 flex-col justify-end">
              <div
                className={totals[index] > 0 ? "bg-accent" : "bg-[#eadcc8]"}
                style={{ height: totals[index] === 0 ? "2px" : `${Math.max(12, (totals[index] / peak) * 100)}%` }}
              />
              <p className="mt-2 truncate text-center font-display text-[11px] font-semibold uppercase tracking-wide text-[#8a6a3d]">
                {new Date(`${day}T12:00:00Z`).toLocaleDateString(locale === "es" ? "es-US" : "en-US", {
                  weekday: "short",
                })}
              </p>
            </div>
          ))}
        </div>
      </section>

      <CryptoPortal connected={cryptoConnected} holdings={holdings} address={cryptoWallet} label={label} field={field} />

      <div className="grid gap-4 lg:grid-cols-2">
        {admin ? (
          <>
            <MoneyForm action={addFundsAction} title={t.addFunds} submit={t.addFunds}>
              <div>
                <p className={label}>{t.availableBalance}</p>
                <p className={`mt-2 font-display text-2xl font-bold ${moneyTone(balanceCents)}`}>
                  {formatMoney(balanceCents, locale)}
                </p>
              </div>
              <AmountField label={label} field={amountField} />
            </MoneyForm>
            <MoneyForm action={transferAction} title={t.transfer} submit={t.transfer}>
              <label className="block">
                <span className={label}>{t.recipient}</span>
                <select name="recipient" required defaultValue="" className={field} disabled={recipients.length === 0}>
                  <option value="">{recipients.length === 0 ? t.noRecipients : t.recipient}</option>
                  {recipients.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name} · {roleLabel(person.role, t)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={label}>{t.process}</span>
                <select name="process" required defaultValue="" className={field}>
                  <option value="">{t.chooseProcess}</option>
                  <option value="pending">{t.processPending}</option>
                  <option value="payment">{t.processPayment}</option>
                </select>
              </label>
              <label className="block">
                <span className={label}>{t.portal}</span>
                <select name="portal" required defaultValue="" className={field}>
                  <option value="">{t.choosePortal}</option>
                  <option value="wire">{t.portalWire}</option>
                  <option value="ach">{t.portalAch}</option>
                  <option value="zelle">{t.portalZelle}</option>
                  <option value="venmo">{t.portalVenmo}</option>
                  <option value="cashapp">{t.portalCashapp}</option>
                  <option value="paypal">{t.portalPaypal}</option>
                  <option value="crypto">{t.portalCrypto}</option>
                  <option value="deposit">{t.portalDeposit}</option>
                </select>
              </label>
              <AmountField label={label} field={amountField} hint={`${t.balance} ${formatMoney(balanceCents, locale)}`} />
            </MoneyForm>
          </>
        ) : (
          <>
            <MoneyForm action={sendAchAction} title={t.achPayout} submit={t.achPayout}>
              <ConnectBank ready={bankReady} />
              <AmountField label={label} field={amountField} hint={`${t.balance} ${formatMoney(balanceCents, locale)}`} />
            </MoneyForm>
            <MoneyForm action={sendCryptoAction} title={t.cryptoPayout} submit={t.cryptoPayout}>
              <label className="block">
                <span className={label}>{t.cryptoAsset}</span>
                <select name="asset" required defaultValue="" className={field}>
                  <option value="">{t.chooseAsset}</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                </select>
              </label>
              <label className="block">
                <span className={label}>{t.cryptoAddress}</span>
                <input name="address" required autoComplete="off" className={field} />
              </label>
              <AmountField label={label} field={amountField} hint={`${t.balance} ${formatMoney(balanceCents, locale)}`} />
            </MoneyForm>
          </>
        )}
      </div>

      <section className="border border-[#e6d7c3] bg-[#fffaf3]">
        <h2 className="border-b border-[#e6d7c3] px-6 py-4 font-display text-sm font-semibold uppercase tracking-[0.16em]">
          {t.transferHistory}
        </h2>
        {history.length === 0 ? (
          <p className="px-6 py-8 text-sm text-[#8a6a3d]">{t.noTransfers}</p>
        ) : (
          <ul>
            {history.map((entry, index) => {
              const when = new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(entry.createdAt));
              const rail = transferRail(entry.process, entry.portal, t);
              const line =
                entry.kind === "credit"
                  ? t.fundsAdded
                  : entry.kind === "out"
                    ? `${t.sentTo} ${entry.otherName}${rail}`
                    : `${t.receivedFrom} ${entry.otherName}${rail}`;
              const inbound = entry.kind !== "out";
              return (
                <li
                  key={entry.id}
                  className={`flex flex-wrap items-center justify-between gap-3 px-6 py-4 ${index % 2 === 0 ? "bg-[#f3eadc]" : "bg-[#fffaf3]"}`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 font-display text-xs font-semibold uppercase tracking-wider ${kindTag[entry.kind]}`}>
                        {kindLabel[entry.kind]}
                      </span>
                      <p>{line}</p>
                    </div>
                    <p className="mt-1 text-sm text-[#8a6a3d]">{when}</p>
                  </div>
                  <p className={`font-display font-semibold ${inbound ? moneyTone(entry.amountCents) : "text-[#8a6a3d]"}`}>
                    {`${inbound ? "+" : "−"}${formatMoney(entry.amountCents, locale)}`}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
