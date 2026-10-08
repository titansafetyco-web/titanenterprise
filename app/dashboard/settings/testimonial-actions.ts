"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { databaseMessage } from "@/lib/supabase/env";

export type ReviewState = { error: string };

const initial = { error: "" };
const photoTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function storePhoto(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  userId: string,
  reviewId: string,
  file: FormDataEntryValue | null,
) {
  if (!(file instanceof File) || file.size === 0) return { path: "" };
  if (file.size > 2 * 1024 * 1024) return { error: "Keep the photo under 2 MB." };
  const ext = photoTypes[file.type];
  if (!ext) return { error: "Use a JPG, PNG, or WebP image." };
  const path = `${userId}/reviews/${reviewId}.${ext}`;
  const uploaded = await supabase.storage.from("avatars").upload(path, new Uint8Array(await file.arrayBuffer()), {
    contentType: file.type,
    upsert: true,
  });
  if (uploaded.error) return { error: "The photo could not be saved." };
  return { path };
}

async function removePhoto(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  userId: string,
  path: string,
) {
  if (!path.startsWith(`${userId}/`)) return;
  await supabase.storage.from("avatars").remove([path]);
}

function readReview(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim();
  const roleEs = String(formData.get("roleEs") ?? "").trim();
  const quoteEs = String(formData.get("quoteEs") ?? "").trim();
  const stars = Number.parseInt(String(formData.get("stars") ?? ""), 10);
  if (name.length < 2 || name.length > 80) return { error: "Enter the reviewer's name." };
  if (role.length < 2 || role.length > 80 || roleEs.length > 80) return { error: "Enter a role." };
  if (quote.length < 12 || (quoteEs.length > 0 && quoteEs.length < 12)) return { error: "Write the review." };
  if (quote.length > 500 || quoteEs.length > 500) return { error: "Keep the review under 500 characters." };
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return { error: "Choose 1 to 5 stars." };
  return { name, role, quote, roleEs, quoteEs, stars };
}

async function adminClient() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { error: "The review could not be saved." as const, supabase: null, userId: "" };
  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage, supabase: null, userId: "" };
  return { error: "", supabase, userId: user.id };
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/dashboard/settings");
}

export async function addTestimonial(_state: ReviewState, formData: FormData): Promise<ReviewState> {
  const gate = await adminClient();
  if (!gate.supabase) return { error: gate.error };
  const review = readReview(formData);
  if ("error" in review) return review;

  const latest = await gate.supabase
    .from("testimonials")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  if (latest.error) return { error: "The review could not be saved." };
  const sortOrder = (latest.data[0]?.sort_order ?? -1) + 1;
  const id = crypto.randomUUID();
  const photo = await storePhoto(gate.supabase, gate.userId, id, formData.get("photo"));
  if ("error" in photo) return photo;

  const saved = await gate.supabase.from("testimonials").insert({
    id,
    name: review.name,
    role: review.role,
    quote: review.quote,
    role_es: review.roleEs,
    quote_es: review.quoteEs,
    stars: review.stars,
    photo_path: photo.path,
    sort_order: sortOrder,
  });
  if (saved.error) {
    if (photo.path) await removePhoto(gate.supabase, gate.userId, photo.path);
    return { error: "The review could not be saved." };
  }
  refresh();
  return initial;
}

export async function updateTestimonial(_state: ReviewState, formData: FormData): Promise<ReviewState> {
  const gate = await adminClient();
  if (!gate.supabase) return { error: gate.error };
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "The review could not be saved." };
  const review = readReview(formData);
  if ("error" in review) return review;
  const existing = await gate.supabase.from("testimonials").select("photo_path").eq("id", id).maybeSingle();
  if (existing.error) return { error: "The review could not be saved." };
  const photo = await storePhoto(gate.supabase, gate.userId, id, formData.get("photo"));
  if ("error" in photo) return photo;
  const photoPath = photo.path || existing.data?.photo_path || "";

  const saved = await gate.supabase
    .from("testimonials")
    .update({
      name: review.name,
      role: review.role,
      quote: review.quote,
      role_es: review.roleEs,
      quote_es: review.quoteEs,
      stars: review.stars,
      photo_path: photoPath,
    })
    .eq("id", id);
  if (saved.error) return { error: "The review could not be saved." };
  if (photo.path && existing.data?.photo_path && existing.data.photo_path !== photo.path) {
    await removePhoto(gate.supabase, gate.userId, existing.data.photo_path);
  }
  refresh();
  return initial;
}

export async function removeTestimonial(formData: FormData): Promise<ReviewState> {
  const gate = await adminClient();
  if (!gate.supabase) return { error: "The review could not be removed." };
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "The review could not be removed." };
  const existing = await gate.supabase.from("testimonials").select("photo_path").eq("id", id).maybeSingle();
  const removed = await gate.supabase.from("testimonials").delete().eq("id", id);
  if (removed.error) return { error: "The review could not be removed." };
  if (existing.data?.photo_path) await removePhoto(gate.supabase, gate.userId, existing.data.photo_path);
  refresh();
  return initial;
}
