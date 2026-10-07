import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WalletPanel } from "@/components/wallet-panel";
import { getCurrentUser } from "@/lib/auth";
import { localizeError } from "@/lib/i18n/errors";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { listChosenJobs } from "@/lib/jobs";
import { loadBankAccount, loadCryptoHoldings, loadCryptoWallet, refreshBankAccount } from "@/lib/payouts";
import { listOwnPayouts, loadWallet } from "@/lib/wallet";
import { formatMoney, type WalletEntry } from "@/lib/money";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).wallet} · ${site.name}` };
}

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ stripe?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/wallet");

  const locale = await getLocale();
  const t = ui(locale);
  const query = await searchParams;
  const admin = user.role === "admin";
  if (!admin && query.stripe === "return") await refreshBankAccount();
  const [wallet, jobs, payouts, bank, crypto, cryptoWallet] = await Promise.all([
    loadWallet(),
    listChosenJobs(),
    admin ? Promise.resolve({ items: [], error: "" }) : listOwnPayouts(),
    admin ? Promise.resolve({ bankReady: false, stripeAccountId: "" }) : loadBankAccount(),
    loadCryptoHoldings(),
    loadCryptoWallet(),
  ]);
  const history: WalletEntry[] = [
    ...wallet.history,
    ...payouts.items
      .filter((item) => item.status !== "failed")
      .map((item) => ({
        id: item.id,
        kind: "out" as const,
        amountCents: item.amountCents,
        otherName: item.hint || (item.method === "ach" ? t.achPayout : t.cryptoPayout),
        createdAt: item.createdAt,
        process: "" as const,
        portal: "" as const,
      })),
  ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <section className="bg-[#f7f1e6]">
      <div className="border-b border-[#e6d7c3] px-6 py-5">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">{t.wallet}</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#8a6a3d]">{t.walletNote}</p>
      </div>
      {wallet.error ? (
        <p className="border-b border-line px-6 py-8 text-[#8a6a3d]">{localizeError(locale, wallet.error)}</p>
      ) : (
        <WalletPanel
          balanceCents={wallet.balanceCents}
          admin={admin}
          bankReady={bank.bankReady}
          recipients={wallet.recipients}
          history={history}
          cryptoConnected={crypto.connected}
          holdings={crypto.holdings}
          cryptoWallet={cryptoWallet}
        />
      )}
      <div className="px-6 pb-6">
        <section className="border border-[#e6d7c3] bg-[#fffaf3]">
          <h2 className="border-b border-[#e6d7c3] px-6 py-4 font-display text-sm font-semibold uppercase tracking-[0.16em]">
            {t.walletJobs}
          </h2>
          {jobs.error ? (
            <p className="px-6 py-8 text-sm text-[#8a6a3d]">{localizeError(locale, jobs.error)}</p>
          ) : jobs.items.length === 0 ? (
            <p className="px-6 py-8 text-sm text-[#8a6a3d]">{t.noChosenJobs}</p>
          ) : (
            <ul>
              {jobs.items.map((job, index) => (
                <li
                  key={job.id}
                  className={`flex flex-wrap items-center justify-between gap-3 px-6 py-4 ${index % 2 === 0 ? "bg-[#f3eadc]" : "bg-[#fffaf3]"}`}
                >
                  <p className="font-display text-sm font-semibold uppercase tracking-wide">{job.title}</p>
                  <p className="bg-[#fff3c4] px-2 py-0.5 font-display text-xs font-semibold uppercase tracking-wider text-[#7a5b10]">
                    {job.payCents > 0 ? `${formatMoney(job.payCents, locale)} · ` : ""}
                    {job.customPayDays
                      ? `${locale === "es" ? "Cada" : "Every"} ${job.customPayDays} ${locale === "es" ? "días" : "days"}`
                      : job.pay === "weekly"
                        ? t.payWeekly
                        : t.payBiweekly}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
