"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { addJob, removeJob, selectJob, setJobProgress, unselectJob } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";
import { databaseMessage } from "@/lib/supabase/env";

export type JobState = {
  error: string;
  success: boolean;
};

const logoTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/jobs");
  return user;
}

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/jobs");
  return user;
}

export async function addJobAction(
  _state: JobState,
  formData: FormData,
): Promise<JobState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  if (user.role !== "admin") redirect("/dashboard");
  let logoPath = "";
  const companyLogo = formData.get("companyLogo");
  if (companyLogo instanceof File && companyLogo.size > 0) {
    if (companyLogo.size > 2 * 1024 * 1024) return { error: "Keep the logo under 2 MB.", success: false };
    const ext = logoTypes[companyLogo.type];
    if (!ext) return { error: "Use a JPG, PNG, or WebP image.", success: false };
    const supabase = await createClient();
    if (!supabase) return { error: databaseMessage, success: false };
    // Match the same user-rooted folder shape used by avatar uploads so storage policies allow it.
    const uploadPath = `${user.id}/job-logo-${Date.now()}.${ext}`;
    const uploaded = await supabase.storage
      .from("avatars")
      .upload(uploadPath, new Uint8Array(await companyLogo.arrayBuffer()), {
        contentType: companyLogo.type,
      });
    // Logo is optional: if upload fails, continue posting the job without blocking submit.
    if (!uploaded.error) logoPath = uploadPath;
  }
  const result = await addJob({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    pay: String(formData.get("pay") ?? ""),
    customPayDays: String(formData.get("customPayDays") ?? ""),
    startsOn: String(formData.get("startsOn") ?? ""),
    expiresOn: String(formData.get("expiresOn") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    message: String(formData.get("message") ?? ""),
    messageEnabled: formData.get("useMessage") === "on",
    link: String(formData.get("link") ?? ""),
    program: String(formData.get("program") ?? ""),
    qualification: String(formData.get("qualification") ?? "beginner"),
    logoPath,
  });
  if (result.error) return { error: result.error, success: false };
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/listing");
  return { error: "", success: true };
}

export async function removeJobAction(formData: FormData) {
  await requireAdmin();
  await removeJob(String(formData.get("id") ?? ""));
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
}

export async function selectJobAction(formData: FormData) {
  await requireUser();
  await selectJob(String(formData.get("id") ?? ""));
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
}

export async function setJobProgressAction(formData: FormData) {
  await requireUser();
  const result = await setJobProgress(String(formData.get("id") ?? ""), String(formData.get("status") ?? ""));
  if (result.error) return result;
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/jobs", "page");
  revalidatePath("/dashboard/wallet");
  return result;
}

export async function startJobTimerAction(formData: FormData) {
  const user = await requireUser();
  const jobId = String(formData.get("id") ?? "");
  if (!jobId) return;
  const supabase = await createClient();
  if (!supabase) return;

  const selection = await supabase
    .from("job_selections")
    .select("status")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .maybeSingle();
  const selectionStatus = String(selection.data?.status ?? "");
  if (selection.error || selectionStatus === "done" || selectionStatus === "incomplete") return;

  const existing = await supabase
    .from("job_timers")
    .select("elapsed_seconds, started_at")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .maybeSingle();

  if (existing.error) return;
  const row = existing.data as { elapsed_seconds: number | null; started_at: string | null } | null;
  if (!row) {
    await supabase.from("job_timers").insert({
      user_id: user.id,
      job_id: jobId,
      elapsed_seconds: 0,
      started_at: new Date().toISOString(),
    });
  } else if (!row.started_at) {
    await supabase
      .from("job_timers")
      .update({ started_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("job_id", jobId);
  }
  revalidatePath("/dashboard/jobs", "page");
}

export async function stopJobTimerAction(formData: FormData) {
  const user = await requireUser();
  const jobId = String(formData.get("id") ?? "");
  if (!jobId) return;
  const supabase = await createClient();
  if (!supabase) return;

  const existing = await supabase
    .from("job_timers")
    .select("elapsed_seconds, started_at")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .maybeSingle();

  if (existing.error || !existing.data) return;
  const row = existing.data as { elapsed_seconds: number | null; started_at: string | null };
  if (!row.started_at) return;
  const startedMs = Date.parse(row.started_at);
  const delta = Number.isFinite(startedMs) ? Math.max(0, Math.floor((Date.now() - startedMs) / 1000)) : 0;
  await supabase
    .from("job_timers")
    .update({
      elapsed_seconds: Math.max(0, (row.elapsed_seconds ?? 0) + delta),
      started_at: null,
    })
    .eq("user_id", user.id)
    .eq("job_id", jobId);

  revalidatePath("/dashboard/jobs", "page");
}

export async function unselectJobAction(formData: FormData) {
  await requireUser();
  await unselectJob(String(formData.get("id") ?? ""));
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
}
