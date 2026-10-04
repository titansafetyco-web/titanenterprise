import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { databaseMessage, supabaseConfigured } from "@/lib/supabase/env";

export type Program = {
  id: string;
  name: string;
};

const starter: Program[] = [
  { id: "safety-products", name: "Safety products" },
  { id: "energy-solutions", name: "Energy solutions" },
  { id: "digital-media", name: "Digital media" },
  { id: "software-development", name: "Software development" },
  { id: "insurance", name: "Insurance" },
];

export async function listPrograms() {
  if (!supabaseConfigured()) return starter;
  const supabase = await createClient();
  if (!supabase) return starter;

  const { data, error } = await supabase
    .from("programs")
    .select("id, name")
    .order("created_at", { ascending: true });

  if (error || !data || data.length === 0) return starter;
  return data as Program[];
}

export async function addProgram(name: string) {
  const trimmed = name.trim();
  if (trimmed.length < 2) return { error: "Enter a program name." };
  if (trimmed.length > 80) return { error: "Keep the name under 80 characters." };

  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage };

  const { error } = await supabase.from("programs").insert({
    id: randomBytes(8).toString("hex"),
    name: trimmed,
  });

  if (error) {
    if (/duplicate|unique/i.test(error.message)) {
      return { error: "That program is already on the list." };
    }
    return { error: "The program could not be added." };
  }
  return { error: "" };
}

export async function removeProgram(id: string) {
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.from("programs").delete().eq("id", id);
}
