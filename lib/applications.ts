import { currentUserId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { databaseMessage, supabaseConfigured } from "@/lib/supabase/env";

export type ReviewStatus = "pending" | "approved" | "denied";

export type AffiliateApplication = {
  id: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  secondProgram: string;
  years: string;
  areas: string;
  background: string;
  note: string;
  status: ReviewStatus;
  createdAt: string;
};

type ApplicationRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  second_program: string;
  years: string;
  areas: string;
  background: string;
  note: string;
  status: ReviewStatus;
  created_at: string;
};

function mapApplication(row: ApplicationRow): AffiliateApplication {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    program: row.program,
    secondProgram: row.second_program,
    years: row.years,
    areas: row.areas,
    background: row.background,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function listApplications() {
  if (!supabaseConfigured()) {
    return { items: [] as AffiliateApplication[], error: databaseMessage };
  }
  const supabase = await createClient();
  if (!supabase) {
    return { items: [] as AffiliateApplication[], error: databaseMessage };
  }

  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, name, email, phone, program, second_program, years, areas, background, note, status, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    const missing = /relation|schema cache|does not exist/i.test(error.message);
    return {
      items: [] as AffiliateApplication[],
      error: missing ? databaseMessage : "Onboarding forms could not be loaded.",
    };
  }

  return {
    items: ((data ?? []) as ApplicationRow[]).map(mapApplication),
    error: "",
  };
}

export async function saveApplication(input: {
  name: string;
  email: string;
  phone: string;
  program: string;
  secondProgram: string;
  years: string;
  areas: string;
  background: string;
  note: string;
}) {
  const supabase = await createClient();
  if (!supabase) return { ok: false as const, error: databaseMessage };

  const { error } = await supabase.from("applications").insert({
    name: input.name,
    email: input.email,
    phone: input.phone,
    program: input.program,
    second_program: input.secondProgram,
    years: input.years,
    areas: input.areas,
    background: input.background,
    note: input.note,
    status: "pending",
    user_id: await currentUserId(),
  });

  if (error) {
    const missing = /relation|schema cache|does not exist/i.test(error.message);
    return {
      ok: false as const,
      error: missing ? databaseMessage : "The onboarding form could not be sent.",
    };
  }
  return { ok: true as const, error: "" };
}

export async function setApplicationStatus(id: string, status: ReviewStatus) {
  const supabase = await createClient();
  if (!supabase) return { ok: false as const, error: databaseMessage };

  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { ok: false as const, error: "That onboarding form could not be updated." };
  }
  return { ok: true as const, error: "" };
}
