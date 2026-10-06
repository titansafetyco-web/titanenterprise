import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatMoney } from "@/lib/money";
import type { Locale } from "@/lib/i18n/locale";
import type { OwnPayout } from "@/lib/wallet";

export function PayoutCard({ payout, locale }: { payout: OwnPayout; locale: Locale }) {
  return (
    <li className="border border-line bg-white px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-2xl font-bold">{formatMoney(payout.amountCents, locale)}</p>
        <StatusBadge status={payout.status} locale={locale} />
      </div>
      <p className="mt-2 text-sm text-muted">
        {payout.method === "ach" ? "ACH" : "Crypto"}
        {payout.hint ? ` · ${payout.hint}` : ""}
      </p>
      <p className="mt-1 text-sm text-muted">
        {new Date(payout.createdAt).toLocaleDateString(locale === "es" ? "es" : "en-US", { dateStyle: "medium" })}
      </p>
    </li>
  );
}
