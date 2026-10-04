"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setApplicationStatus, type ReviewStatus } from "@/lib/applications";
import { getCurrentUser, setProfileStatus } from "@/lib/auth";

function decision(value: FormDataEntryValue | null): ReviewStatus | null {
  if (value === "approved" || value === "denied") return value;
  return null;
}

async function requireReviewer() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

export async function reviewAccount(formData: FormData) {
  const user = await requireReviewer();
  const id = String(formData.get("id") ?? "");
  const status = decision(formData.get("decision"));
  if (!id || !status) return;
  if (id === user.id) return;
  await setProfileStatus(id, status);
  revalidatePath("/admin");
  revalidatePath("/dashboard/team");
}

export async function reviewApplication(formData: FormData) {
  await requireReviewer();
  const id = String(formData.get("id") ?? "");
  const status = decision(formData.get("decision"));
  if (!id || !status) return;
  await setApplicationStatus(id, status);
  revalidatePath("/admin");
}
