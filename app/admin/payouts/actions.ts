"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { approvePayoutBatch } from "@/lib/api/payouts";
import { getCurrentUser } from "@/lib/auth";

export type PayoutBatchActionState = {
  error: string;
  success: string;
  processed: number;
  totalCents: number;
};

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/payouts");
  if (user.role !== "admin") redirect("/dashboard");
}

export async function approvePayoutBatchAction(
  _state: PayoutBatchActionState,
  formData: FormData,
): Promise<PayoutBatchActionState> {
  await requireAdmin();
  const thresholdCents = Number(formData.get("threshold_cents") ?? 10_000);
  const memberIds = formData
    .getAll("member_ids")
    .map((value) => String(value))
    .filter(Boolean);
  const result = await approvePayoutBatch({
    memberIds,
    thresholdCents: Number.isFinite(thresholdCents) && thresholdCents > 0 ? thresholdCents : 10_000,
  });
  revalidatePath("/admin/payouts");
  revalidatePath("/dashboard/payouts");
  if (result.error) {
    return { error: result.error, success: "", processed: 0, totalCents: 0 };
  }
  return {
    error: "",
    success: result.note,
    processed: result.processed,
    totalCents: result.totalCents,
  };
}
