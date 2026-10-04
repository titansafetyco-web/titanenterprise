"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { addJob, removeJob, selectJob, setJobProgress, unselectJob } from "@/lib/jobs";

export type JobState = {
  error: string;
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
  const result = await addJob({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    pay: String(formData.get("pay") ?? ""),
    startsOn: String(formData.get("startsOn") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    message: String(formData.get("message") ?? ""),
    link: String(formData.get("link") ?? ""),
    program: String(formData.get("program") ?? ""),
  });
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/listing");
  return result;
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
  await setJobProgress(String(formData.get("id") ?? ""), String(formData.get("status") ?? ""));
  revalidatePath("/dashboard");
}

export async function unselectJobAction(formData: FormData) {
  await requireUser();
  await unselectJob(String(formData.get("id") ?? ""));
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
}
