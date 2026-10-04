"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendAccountNotice } from "@/lib/account-mail";
import { setApplicationStatus, type ReviewStatus } from "@/lib/applications";
import { getCurrentUser, getProfile, setProfileStatus } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

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
  const profile = await getProfile(id);
  const saved = await setProfileStatus(id, status);
  if (!saved.ok || !profile) return;
  await sendAccountNotice({
    name: profile.name,
    email: profile.email,
    kind: status === "approved" ? "approved" : "denied",
  });
  revalidatePath("/admin");
  revalidatePath("/dashboard/team");
}

export async function deleteDeniedAccount(id: string): Promise<{ error: string }> {
  const user = await requireReviewer();
  if (!id || id === user.id) return { error: "The account could not be deleted." };

  const supabase = await createClient();
  if (!supabase) return { error: "The account could not be deleted." };

  const deleted = await supabase.rpc("delete_denied_account", { target: id });
  if (deleted.error) {
    const text = deleted.error.message.toLowerCase();
    if (text.includes("transfer")) return { error: "This account has transfers and cannot be deleted." };
    return { error: "The account could not be deleted." };
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard/team");
  return { error: "" };
}

export async function reviewApplication(formData: FormData) {
  await requireReviewer();
  const id = String(formData.get("id") ?? "");
  const status = decision(formData.get("decision"));
  if (!id || !status) return;
  await setApplicationStatus(id, status);
  revalidatePath("/admin");
}
