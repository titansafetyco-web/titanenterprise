"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { readProfileCsv } from "@/lib/profile-csv";
import { phoneDigits } from "@/lib/phone";
import { birthDate, stateCode } from "@/lib/profile-details";
import { createClient } from "@/lib/supabase/server";
import { databaseMessage } from "@/lib/supabase/env";

export type PhotoState = { error: string };

const types: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadAvatar(_state: PhotoState, formData: FormData): Promise<PhotoState> {
  const user = await getCurrentUser();
  const file = formData.get("photo");
  if (!user || !(file instanceof File) || file.size === 0) return { error: "Choose a photo." };
  if (file.size > 2 * 1024 * 1024) return { error: "Keep the photo under 2 MB." };
  const ext = types[file.type];
  if (!ext) return { error: "Use a JPG, PNG, or WebP image." };

  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage };

  const listed = await supabase.storage.from("avatars").list(user.id);
  if (listed.error) return { error: "The photo could not be saved." };
  if (listed.data.length > 0) {
    const removed = await supabase.storage
      .from("avatars")
      .remove(listed.data.map((item) => `${user.id}/${item.name}`));
    if (removed.error) return { error: "The photo could not be saved." };
  }

  const path = `${user.id}/${Date.now()}.${ext}`;
  const uploaded = await supabase.storage.from("avatars").upload(path, new Uint8Array(await file.arrayBuffer()), {
    contentType: file.type,
  });
  if (uploaded.error) return { error: "The photo could not be saved." };

  const saved = await supabase.rpc("set_avatar", { path });
  if (saved.error) {
    await supabase.storage.from("avatars").remove([path]);
    return { error: "The photo could not be saved." };
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/settings");
  return { error: "" };
}

async function storeDetails(birth: string, region: string) {
  const date = birthDate(birth);
  const code = stateCode(region);
  if (date === null) return "Choose a date of birth.";
  if (code === null) return "Choose a state.";
  const supabase = await createClient();
  if (!supabase) return databaseMessage;
  const saved = await supabase.rpc("set_profile_details", { birth: date, region: code });
  if (saved.error) return "The profile could not be saved.";
  revalidatePath("/dashboard/settings");
  return "";
}

export async function setSiteMaintenance(_state: PhotoState, formData: FormData): Promise<PhotoState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { error: "The website could not be updated." };
  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage };
  const enabled = formData.get("enabled") === "true";
  const saved = await supabase.rpc("set_maintenance", { enabled });
  if (saved.error) return { error: "The website could not be updated." };
  revalidatePath("/", "layout");
  revalidatePath("/dashboard/settings");
  return { error: "" };
}

export async function saveProfileDetails(_state: PhotoState, formData: FormData): Promise<PhotoState> {
  const user = await getCurrentUser();
  if (!user) return { error: "The profile could not be saved." };
  const accountName = String(formData.get("accountName") ?? "").trim();
  const accountEmail = String(formData.get("accountEmail") ?? "").trim();
  const accountPhone = String(formData.get("accountPhone") ?? "");
  if (accountName.length < 2) return { error: "Enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountEmail)) return { error: "Enter a valid email." };
  const digits = phoneDigits(accountPhone);
  if (accountPhone.trim() && digits.length !== 10) return { error: "Enter a 10-digit phone number." };

  const date = birthDate(String(formData.get("birth") ?? ""));
  const code = stateCode(String(formData.get("state") ?? ""));
  if (date === null) return { error: "Choose a date of birth." };
  if (code === null) return { error: "Choose a state." };

  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage };
  const saved = await supabase.rpc("set_account_profile", {
    account_name: accountName,
    account_email: accountEmail,
    account_phone: digits,
    birth: date,
    region: code,
  });
  if (saved.error) {
    const text = saved.error.message.toLowerCase();
    if (text.includes("already")) return { error: "An account with that email already exists." };
    if (text.includes("phone")) return { error: "Enter a 10-digit phone number." };
    if (text.includes("email")) return { error: "Enter a valid email." };
    if (text.includes("name")) return { error: "Enter your name." };
    return { error: "The profile could not be saved." };
  }
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/settings");
  return { error: "" };
}

export async function formatAccount(_state: PhotoState, formData: FormData): Promise<PhotoState> {
  const user = await getCurrentUser();
  if (!user || formData.get("confirm") !== "format") return { error: "The account could not be formatted." };

  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage };

  const listed = await supabase.storage.from("avatars").list(user.id);
  if (listed.error) return { error: "The account could not be formatted." };
  if (listed.data.length > 0) {
    const removed = await supabase.storage
      .from("avatars")
      .remove(listed.data.map((item) => `${user.id}/${item.name}`));
    if (removed.error) return { error: "The account could not be formatted." };
  }

  const formatted = await supabase.rpc("format_account");
  if (formatted.error) return { error: "The account could not be formatted." };

  revalidatePath("/dashboard", "layout");
  return { error: "" };
}

export async function deleteAccount(_state: PhotoState, formData: FormData): Promise<PhotoState> {
  const user = await getCurrentUser();
  if (!user || formData.get("confirm") !== "delete") return { error: "The account could not be deleted." };

  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage };

  const listed = await supabase.storage.from("avatars").list(user.id);
  if (listed.error) return { error: "The account could not be deleted." };
  if (listed.data.length > 0) {
    const removed = await supabase.storage
      .from("avatars")
      .remove(listed.data.map((item) => `${user.id}/${item.name}`));
    if (removed.error) return { error: "The account could not be deleted." };
  }

  const deleted = await supabase.rpc("delete_own_account");
  if (deleted.error) {
    const text = deleted.error.message.toLowerCase();
    if (text.includes("last admin")) return { error: "This is the only admin account and cannot be deleted." };
    if (text.includes("transfer")) return { error: "This account has transfers and cannot be deleted." };
    return { error: "The account could not be deleted." };
  }

  await supabase.auth.signOut();
  redirect("/");
}

export async function importProfileCsv(_state: PhotoState, formData: FormData): Promise<PhotoState> {
  const user = await getCurrentUser();
  const file = formData.get("csv");
  if (!user || !(file instanceof File) || file.size === 0) {
    return { error: "The file needs a header and one profile row." };
  }
  if (file.size > 100_000) return { error: "The file has more than one account." };
  const parsed = readProfileCsv(await file.text(), user.email);
  if (parsed.error) return { error: parsed.error };
  return {
    error: await storeDetails(parsed.birth ?? user.birthDate, parsed.region ?? user.state),
  };
}
