import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EarningsSummary } from "@/components/earnings/EarningsSummary";
import { LedgerTable } from "@/components/earnings/LedgerTable";
import { PayoutHistory } from "@/components/earnings/PayoutHistory";
import { loadEarnings } from "@/lib/api/earnings";
import { listMemberPayouts } from "@/lib/api/payouts";
import { getCurrentUser } from "@/lib/auth";
import { localizeError } from "@/lib/i18n/errors";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).payoutsTitle} · Titan Safety Co.` };
}

export default async function PayoutsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/payouts");
  const locale = await getLocale();
  const t = ui(locale);
  const [earnings, payouts] = await Promise.all([loadEarnings(), listMemberPayouts()]);
  const error = localizeError(locale, earnings.error || payouts.error);

  return (
    <section>
      <h1 className="font-display text-4xl font-bold uppercase tracking-wide">{t.payoutsTitle}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{t.footerDisclaimer}</p>
      <Link href="/payout-policy" className="mt-3 inline-flex min-h-11 items-center font-display text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        {t.viewPayoutPolicy}
      </Link>
      {error ? <p className="mt-6 text-sm text-muted">{error}</p> : null}
      <div className="mt-8">
        <EarningsSummary
          availableCents={earnings.availableCents}
          pendingCents={earnings.pendingCents}
          paidCents={earnings.paidCents}
          locale={locale}
          availableLabel={t.walletBalance}
          paidLabel={t.paidFromHistory}
          pendingLabel={t.payoutsPending}
          empty={t.notAvailableYet}
        />
      </div>
      <h2 className="mt-10 font-display text-2xl font-bold uppercase tracking-wide">{t.payoutsNav}</h2>
      <div className="mt-4">
        <PayoutHistory items={payouts.items} locale={locale} empty={t.noPayoutScheduled} />
      </div>
      <h2 className="mt-10 font-display text-2xl font-bold uppercase tracking-wide">{t.earnings}</h2>
      <div className="mt-4">
        <LedgerTable items={earnings.history} locale={locale} empty={earnings.availableCents === 0 ? t.noEarnings : t.notAvailableYet} />
      </div>
    </section>
  );
}
