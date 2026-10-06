"use client";

import { useActionState, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { formatMoney } from "@/lib/money";
import type { AdminPayoutBatchSummary, AdminPayoutQueueItem } from "@/types/titan";

type PayoutBatchActionState = {
  error: string;
  success: string;
  processed: number;
  totalCents: number;
};

const initialPayoutBatchActionState: PayoutBatchActionState = {
  error: "",
  success: "",
  processed: 0,
  totalCents: 0,
};

export function PayoutBatchPreview({
  locale,
  title,
  queue,
  summary,
  thresholdLabel,
  readyLabel,
  heldLabel,
  membersLabel,
  queueTitle,
  empty,
  reasonLabel,
  roleLabel,
  balanceLabel,
  statusReady,
  statusHold,
  approve,
  cancel,
  confirmTitle,
  confirmBody,
  resultLabel,
  action,
}: {
  locale: Locale;
  title: string;
  queue: AdminPayoutQueueItem[];
  summary: AdminPayoutBatchSummary;
  thresholdLabel: string;
  readyLabel: string;
  heldLabel: string;
  membersLabel: string;
  queueTitle: string;
  empty: string;
  reasonLabel: string;
  roleLabel: string;
  balanceLabel: string;
  statusReady: string;
  statusHold: string;
  approve: string;
  cancel: string;
  confirmTitle: string;
  confirmBody: string;
  resultLabel: string;
  action: (state: PayoutBatchActionState, formData: FormData) => Promise<PayoutBatchActionState>;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, initialPayoutBatchActionState);
  const ready = useMemo(() => queue.filter((item) => item.status === "ready"), [queue]);
  const hasReady = ready.length > 0;
  const currency = (cents: number) => formatMoney(cents, locale);
  const statusText = (item: AdminPayoutQueueItem) => (item.status === "ready" ? statusReady : statusHold);

  return (
    <section className="border border-line bg-white p-4 md:p-6">
      <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        {thresholdLabel}
      </p>
      <h2 className="mt-3 font-display text-2xl font-bold uppercase tracking-wide md:text-3xl">{title}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3 md:gap-4">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{readyLabel}</p>
          <p className="mt-1 font-display text-2xl font-bold">{currency(summary.readyCents)}</p>
        </div>
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{heldLabel}</p>
          <p className="mt-1 font-display text-2xl font-bold">{currency(summary.heldCents)}</p>
        </div>
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {membersLabel}
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{summary.readyMembers}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!hasReady}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center bg-accent px-5 font-display text-xs font-semibold uppercase tracking-[0.14em] text-ink hover:bg-[#e0b400] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {approve}
      </button>
      {!hasReady ? <p className="mt-3 text-sm text-muted">{empty}</p> : null}
      {state.error ? <p className="mt-3 text-sm text-muted">{state.error}</p> : null}
      {state.success ? (
        <p className="mt-3 text-sm text-muted">
          {state.success} {resultLabel}: {state.processed} / {currency(state.totalCents)}
        </p>
      ) : null}
      {open ? (
        <form action={formAction} className="mt-5 border border-line bg-canvas p-4 md:p-5">
          <h3 className="font-display text-lg font-bold uppercase tracking-wide">{confirmTitle}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">{confirmBody}</p>
          <input type="hidden" name="threshold_cents" value={String(summary.thresholdCents)} />
          {ready.map((item) => (
            <input key={item.memberId} type="hidden" name="member_ids" value={item.memberId} />
          ))}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-11 w-full items-center justify-center border border-ink px-4 font-display text-xs font-semibold uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {approve}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 w-full items-center justify-center px-4 font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted sm:w-auto"
            >
              {cancel}
            </button>
          </div>
        </form>
      ) : null}
      <div className="mt-6 border-t border-line pt-5 md:mt-8 md:pt-6">
        <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">{queueTitle}</h3>
        {queue.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{empty}</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border border-line">
            {queue.map((item) => (
              <li key={item.memberId} className="bg-white px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-display text-sm font-semibold uppercase tracking-[0.1em]">{item.name}</p>
                  <p className="text-sm text-muted">
                    {balanceLabel}: {currency(item.balanceCents)}
                  </p>
                </div>
                <p className="mt-1 break-all text-sm text-muted">{item.email}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-muted">
                  {roleLabel}: {item.role}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-muted">{statusText(item)}</p>
                <p className="mt-1 text-sm text-muted">
                  {reasonLabel}: {item.reason}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
