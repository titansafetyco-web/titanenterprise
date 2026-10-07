import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { approvePayoutBatchAction } from "@/app/admin/payouts/actions";
import { AdminSidebar } from "@/components/admin-sidebar";
import { PayoutBatchPreview } from "@/components/admin/PayoutBatchPreview";
import { ADMIN_PAYOUT_THRESHOLD_CENTS, loadAdminPayoutQueue } from "@/lib/api/payouts";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).payoutsTitle} · ${site.name}` };
}

export default async function AdminPayoutsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/payouts");
  if (user.role !== "admin") redirect("/dashboard");
  const locale = await getLocale();
  const t = ui(locale);
  const queue = await loadAdminPayoutQueue(ADMIN_PAYOUT_THRESHOLD_CENTS);

  return (
    <div className="min-h-svh bg-canvas lg:flex">
      <AdminSidebar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-14">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">{t.payoutsTitle}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{t.adminPayoutLead}</p>
          {queue.error ? <p className="mt-6 text-sm text-muted">{queue.error}</p> : null}
          <div className="mt-8">
            <PayoutBatchPreview
              locale={locale}
              title={t.adminPayoutBatchTitle}
              queue={queue.items}
              summary={queue.summary}
              thresholdLabel={t.adminPayoutThreshold}
              readyLabel={t.adminPayoutReady}
              heldLabel={t.adminPayoutHeld}
              membersLabel={t.members}
              queueTitle={t.adminPayoutQueue}
              empty={t.adminPayoutQueueEmpty}
              reasonLabel={t.adminPayoutReason}
              roleLabel={t.role}
              balanceLabel={t.walletBalance}
              statusReady={t.adminPayoutStatusReady}
              statusHold={t.adminPayoutStatusHold}
              approve={t.approveBatch}
              cancel={t.cancel}
              confirmTitle={t.batchConfirm}
              confirmBody={t.adminPayoutConfirmBody}
              resultLabel={t.adminPayoutResult}
              action={approvePayoutBatchAction}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
