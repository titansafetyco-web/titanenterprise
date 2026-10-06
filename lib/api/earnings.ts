import { listOwnPayouts, loadWallet } from "@/lib/wallet";

export async function loadEarnings() {
  const [wallet, payouts] = await Promise.all([loadWallet(), listOwnPayouts()]);
  const paid = wallet.history
    .filter((entry) => entry.kind === "in" || entry.kind === "credit")
    .reduce((sum, entry) => sum + entry.amountCents, 0);
  const out = wallet.history
    .filter((entry) => entry.kind === "out")
    .reduce((sum, entry) => sum + entry.amountCents, 0);
  const pending = payouts.items
    .filter((item) => item.status === "pending" || item.status === "processing")
    .reduce((sum, item) => sum + item.amountCents, 0);
  return {
    availableCents: wallet.balanceCents,
    history: wallet.history,
    paidCents: paid,
    sentCents: out,
    pendingCents: pending,
    error: wallet.error || payouts.error,
  };
}
