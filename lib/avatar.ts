import { supabaseUrl } from "@/lib/supabase/env";

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  return (last ? `${first[0] ?? ""}${last[0] ?? ""}` : first.slice(0, 2)).toUpperCase();
}

export function avatarUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("/") || path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${supabaseUrl}/storage/v1/object/public/avatars/${path}`;
}
