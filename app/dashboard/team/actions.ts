"use server";

import { revalidatePath } from "next/cache";
import { createMemberAccount, getCurrentUser } from "@/lib/auth";
import { formatPhone, phoneDigits } from "@/lib/phone";
import { expiresOnFromMessage } from "@/lib/jobs";
import { ratingFromCompletions } from "@/lib/ratings";
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
  points: number;
  stars: number;
  level: "beginner" | "intermediate" | "expert";
  jobs: {
    id: string;
    jobId: string;
    title: string;
    pay: string;
    payCents: number;
    startsOn: string;
    expiresOn: string;
    status: string;
    timerElapsedSeconds: number;
    timerStartedAt: string;
    timerRunning: boolean;
  }[];
  forms: { id: string; program: string; status: string }[];
  error: string;
};

const emptyDetails: AccountDetails = {
  balanceCents: 0,
  earnedCents: 0,
  points: 0,
  stars: 0,
  level: "beginner",
  jobs: [],
  forms: [],
  error: "",
};

export async function verifyJobAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { error: "That job status could not be saved." };
  const agentId = String(formData.get("userId") ?? "");
  const jobId = String(formData.get("jobId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!agentId || !jobId || (status !== "done" && status !== "incomplete")) {
    return { error: "That job status could not be saved." };
  }
  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage };
  const { error } = await supabase.rpc("verify_job_progress", {
    target_user: agentId,
    target_job: jobId,
    next_status: status,
  });
  if (error) return { error: "That job status could not be saved." };
  revalidatePath("/dashboard/team");
  revalidatePath("/dashboard/jobs", "page");
  revalidatePath("/dashboard/wallet");
  return { error: "" };
}

export async function loadAccountDetails(id: string): Promise<AccountDetails> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.id !== id)) {
    return { ...emptyDetails, error: "That account could not be loaded." };
  }
  const supabase = await createClient();
  if (!supabase) return { ...emptyDetails, error: databaseMessage };

  const [wallet, transfers, credits, jobs, timers, forms] = await Promise.all([
    supabase.from("wallets").select("balance_cents").eq("user_id", id).maybeSingle(),
    supabase.from("wallet_transfers").select("amount_cents").eq("to_user", id),
    supabase.from("wallet_credits").select("amount_cents").eq("user_id", id),
    supabase.from("job_selections").select("id, status, job_id, jobs(title, pay, pay_cents, starts_on, message)").eq("user_id", id),
    supabase.from("job_timers").select("job_id, elapsed_seconds, started_at").eq("user_id", id),
    supabase
      .from("applications")
      .select("id, program, status")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (wallet.error || transfers.error || credits.error || jobs.error || forms.error) {
    return { ...emptyDetails, error: "That account could not be loaded." };
  }

  const timerByJob = new Map(
    ((timers.error ? [] : timers.data ?? []) as {
      job_id: string;
      elapsed_seconds: number | null;
      started_at: string | null;
    }[]).map((row) => [row.job_id, row]),
  );

  const transferCents = ((transfers.data ?? []) as { amount_cents: number }[]).reduce(
    (total, row) => total + row.amount_cents,
    0,
  );
  const creditCents = ((credits.data ?? []) as { amount_cents: number }[]).reduce(
    (total, row) => total + row.amount_cents,
    0,
  );
  const earnedCents = transferCents + creditCents;

  const chosen = ((jobs.data ?? []) as {
    id: string;
    status: string;
    job_id: string;
    jobs:
      | { title: string; pay: string; pay_cents: number | null; starts_on: string | null; message: string | null }
      | { title: string; pay: string; pay_cents: number | null; starts_on: string | null; message: string | null }[]
      | null;
  }[]).flatMap((row) => {
    const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs;
    if (!job) return [];
    const timer = timerByJob.get(row.job_id);
    const startedAt = timer?.started_at ?? "";
    const running = row.status === "processing" && Boolean(startedAt);
    return [{
      id: row.id,
      jobId: row.job_id,
      title: job.title,
      pay: job.pay,
      payCents: job.pay_cents ?? 0,
      startsOn: job.starts_on ?? "",
      expiresOn: expiresOnFromMessage(job.message ?? ""),
      status: row.status,
      timerElapsedSeconds: Math.max(0, timer?.elapsed_seconds ?? 0),
      timerStartedAt: startedAt,
      timerRunning: running,
    }];
  });
  const completedCount = chosen.filter((job) => job.status === "done").length;
  const rating = ratingFromCompletions(completedCount);

  return {
    balanceCents: wallet.data?.balance_cents ?? 0,
    earnedCents,
    points: rating.points,
    stars: rating.stars,
    level: rating.level,
    jobs: chosen,
    forms: ((forms.data ?? []) as { id: string; program: string; status: string }[]).map((row) => ({
      id: row.id,
      program: row.program,
      status: row.status,
    })),
    error: "",
  };
}
