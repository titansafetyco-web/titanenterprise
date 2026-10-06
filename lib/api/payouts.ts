import { getCurrentUser, listProfiles } from "@/lib/auth";
import { listOwnPayouts, listWalletRecords } from "@/lib/wallet";
import type { AdminPayoutBatchSummary, AdminPayoutQueueItem } from "@/types/titan";

export const ADMIN_PAYOUT_THRESHOLD_CENTS = 10_000;

export async function listMemberPayouts() {
  return listOwnPayouts();
}

export async function loadAdminPayoutQueue(thresholdCents = ADMIN_PAYOUT_THRESHOLD_CENTS) {
  const empty = {
    items: [] as AdminPayoutQueueItem[],
    summary: {
      thresholdCents,
      totalMembers: 0,
      readyMembers: 0,
      heldMembers: 0,
      readyCents: 0,
      heldCents: 0,
      generatedAt: new Date().toISOString(),
    } satisfies AdminPayoutBatchSummary,
    error: "",
  };

  const [profiles, wallets] = await Promise.all([listProfiles(), listWalletRecords()]);
  if (profiles.error || wallets.error) {
    return {
      ...empty,
      error: profiles.error || wallets.error || "The payout queue could not be loaded.",
    };
  }

  const balanceByUser = new Map(wallets.balances.map((item) => [item.userId, item.cents]));
  const isEligibleRole = (
    role: string,
  ): role is AdminPayoutQueueItem["role"] =>
    role === "agent" || role === "affiliate" || role === "team" || role === "member";
  const approved = profiles.items.filter((profile) => profile.status === "approved");
  const membersWithBalance = approved.filter(
    (profile) => (balanceByUser.get(profile.id) ?? 0) > 0 && isEligibleRole(profile.role),
  );

  const items: AdminPayoutQueueItem[] = membersWithBalance
    .map((member) => {
      if (!isEligibleRole(member.role)) return null;
      const balanceCents = balanceByUser.get(member.id) ?? 0;
      const ready = balanceCents >= thresholdCents;
      return {
        memberId: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        balanceCents,
        eligibleCents: ready ? balanceCents : 0,
        status: ready ? "ready" : "hold",
        reason: ready
          ? "Ready for the next manual payout batch."
          : `Hold until the balance reaches $${Math.max(1, Math.ceil(thresholdCents / 100))}.`,
      };
    })
    .filter((item): item is AdminPayoutQueueItem => item !== null)
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "ready" ? -1 : 1;
      return b.balanceCents - a.balanceCents;
    });

  const ready = items.filter((item) => item.status === "ready");
  const held = items.filter((item) => item.status === "hold");

  return {
    items,
    summary: {
      thresholdCents,
      totalMembers: items.length,
      readyMembers: ready.length,
      heldMembers: held.length,
      readyCents: ready.reduce((sum, item) => sum + item.eligibleCents, 0),
      heldCents: held.reduce((sum, item) => sum + item.balanceCents, 0),
      generatedAt: new Date().toISOString(),
    } satisfies AdminPayoutBatchSummary,
    error: "",
  };
}

export async function approvePayoutBatch(input?: {
  memberIds?: string[];
  thresholdCents?: number;
}): Promise<{ error: string; processed: number; totalCents: number; note: string }> {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "admin") {
    return { error: "Only admins can approve payout batches.", processed: 0, totalCents: 0, note: "" };
  }

  const threshold = input?.thresholdCents ?? ADMIN_PAYOUT_THRESHOLD_CENTS;
  const queue = await loadAdminPayoutQueue(threshold);
  if (queue.error) return { error: queue.error, processed: 0, totalCents: 0, note: "" };

  const pick = new Set(input?.memberIds ?? []);
  const ready = queue.items.filter(
    (item) => item.status === "ready" && (pick.size === 0 || pick.has(item.memberId)),
  );

  if (ready.length === 0) {
    return { error: "No eligible members are ready for this payout batch.", processed: 0, totalCents: 0, note: "" };
  }

  return {
    error: "",
    processed: ready.length,
    totalCents: ready.reduce((sum, item) => sum + item.eligibleCents, 0),
    note: "Batch marked for manual payout processing. No funds were sent from this screen.",
  };
}
