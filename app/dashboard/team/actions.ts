"use server";

import { revalidatePath } from "next/cache";
import { createMemberAccount, getCurrentUser } from "@/lib/auth";
import { formatPhone, phoneDigits } from "@/lib/phone";
import { createClient } from "@/lib/supabase/server";
import { databaseMessage } from "@/lib/supabase/env";

export type MemberState = { error: string };

export async function addMemberAction(_prev: MemberState, formData: FormData): Promise<MemberState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { error: "The account could not be created." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const phone = formatPhone(String(formData.get("phone") ?? ""));
  const role = String(formData.get("role") ?? "");

  if (name.length < 2) return { error: "Enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email." };
  if (phoneDigits(phone).length !== 10) return { error: "Enter a 10-digit phone number." };
  if (password.length < 8) return { error: "Use at least 8 characters for the password." };
  if (password !== String(formData.get("confirm") ?? "")) return { error: "Passwords do not match." };
  if (role !== "team" && role !== "member") return { error: "The account could not be created." };

  const result = await createMemberAccount({ name, email, password, phone, role });
  if (!result.ok) return { error: result.error };
  revalidatePath("/dashboard/team");
  return { error: "" };
}

export type AccountDetails = {
  balanceCents: number;
  earnedCents: number;
  jobs: { id: string; title: string; pay: string; status: string }[];
  forms: { id: string; program: string; status: string }[];
  error: string;
};

const emptyDetails: AccountDetails = { balanceCents: 0, earnedCents: 0, jobs: [], forms: [], error: "" };

export async function loadAccountDetails(id: string): Promise<AccountDetails> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.id !== id)) {
    return { ...emptyDetails, error: "That account could not be loaded." };
  }
  const supabase = await createClient();
  if (!supabase) return { ...emptyDetails, error: databaseMessage };

  const [wallet, earned, jobs, forms] = await Promise.all([
    supabase.from("wallets").select("balance_cents").eq("user_id", id).maybeSingle(),
    supabase.from("wallet_transfers").select("amount_cents").eq("to_user", id),
    supabase.from("job_selections").select("id, status, jobs(title, pay)").eq("user_id", id),
    supabase
      .from("applications")
      .select("id, program, status")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (wallet.error || earned.error || jobs.error || forms.error) {
    return { ...emptyDetails, error: "That account could not be loaded." };
  }

  const earnedCents = ((earned.data ?? []) as { amount_cents: number }[]).reduce(
    (total, row) => total + row.amount_cents,
    0,
  );

  const chosen = ((jobs.data ?? []) as {
    id: string;
    status: string;
    jobs: { title: string; pay: string } | { title: string; pay: string }[] | null;
  }[]).flatMap((row) => {
    const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs;
    if (!job) return [];
    return [{ id: row.id, title: job.title, pay: job.pay, status: row.status }];
  });

  return {
    balanceCents: wallet.data?.balance_cents ?? 0,
    earnedCents,
    jobs: chosen,
    forms: ((forms.data ?? []) as { id: string; program: string; status: string }[]).map((row) => ({
      id: row.id,
      program: row.program,
      status: row.status,
    })),
    error: "",
  };
}
