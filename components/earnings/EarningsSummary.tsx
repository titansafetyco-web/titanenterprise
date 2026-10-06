import { formatMoney } from "@/lib/money";
import type { Locale } from "@/lib/i18n/locale";

export function EarningsSummary({
  availableCents,
  pendingCents,
  paidCents,
  locale,
  availableLabel,
  paidLabel,
  pendingLabel,
  empty,
}: {
  availableCents: number;
  pendingCents: number | null;
  paidCents: number;
  locale: Locale;
  availableLabel: string;
  paidLabel: string;
  pendingLabel: string;
  empty: string;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <li className="border-t-4 border-accent bg-white p-6">
        <p className="font-display text-3xl font-bold">{formatMoney(availableCents, locale)}</p>
        <p className="mt-2 font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{availableLabel}</p>
      </li>
      <li className="border-t-4 border-line bg-white p-6">
        <p className="font-display text-3xl font-bold">
          {pendingCents === null ? "—" : formatMoney(pendingCents, locale)}
        </p>
        <p className="mt-2 font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{pendingLabel}</p>
        {pendingCents === null ? <p className="mt-2 text-sm text-muted">{empty}</p> : null}
      </li>
      <li className="border-t-4 border-accent bg-white p-6 sm:col-span-2">
        <p className="font-display text-3xl font-bold">{formatMoney(paidCents, locale)}</p>
        <p className="mt-2 font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{paidLabel}</p>
      </li>
    </ul>
  );
}
