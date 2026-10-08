import { avatarUrl } from "@/lib/avatar";
import type { Locale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";

export type StoredReview = {
  id: string;
  name: string;
  role: string;
  quote: string;
  roleEs: string;
  quoteEs: string;
  stars: number;
  photoPath: string;
  photoUrl: string;
};

export type PublicReview = {
  quote: string;
  name: string;
  role: string;
  stars: number;
  photoUrl: string;
};

type ReviewRow = {
  id: string;
  name: string;
  role: string;
  quote: string;
  role_es: string | null;
  quote_es: string | null;
  stars: number;
  photo_path: string | null;
};

function mapRow(row: ReviewRow): StoredReview {
  const photoPath = row.photo_path ?? "";
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    quote: row.quote,
    roleEs: row.role_es ?? "",
    quoteEs: row.quote_es ?? "",
    stars: row.stars,
    photoPath,
    photoUrl: avatarUrl(photoPath),
  };
}

export async function listTestimonials(): Promise<StoredReview[] | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, name, role, quote, role_es, quote_es, stars, photo_path")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error || !data) return null;
  return data.map((row) => mapRow(row as ReviewRow));
}

export async function listPublicTestimonials(locale: Locale): Promise<PublicReview[] | null> {
  const reviews = await listTestimonials();
  if (!reviews) return null;
  return reviews.map((review) => ({
    name: review.name,
    role: locale === "es" && review.roleEs ? review.roleEs : review.role,
    quote: locale === "es" && review.quoteEs ? review.quoteEs : review.quote,
    stars: review.stars,
    photoUrl: review.photoUrl,
  }));
}
