import { currentUserId } from "@/lib/auth";
import { listPrograms } from "@/lib/programs";
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

export const experienceYears = [
  "Less than 1 year",
  "1 to 3 years",
  "3 to 5 years",
  "More than 5 years",
] as const;

export const experienceAreas = [
  "Lead scouting",
  "Audience research",
  "Digital campaigns",
  "Onboarding support",
] as const;

const yearSet = new Set<string>(experienceYears);
const areaSet = new Set<string>(experienceAreas);

export type OnboardingDetails = {
  program: string;
  secondProgram: string;
  years: string;
  areas: string;
  background: string;
  note: string;
};

export async function readOnboarding(formData: FormData): Promise<
  { ok: true; value: OnboardingDetails } | { ok: false; error: string }
> {
  const programId = String(formData.get("program") ?? "").trim();
  const secondId = String(formData.get("second") ?? "").trim();
  const years = String(formData.get("years") ?? "").trim();
  const chosenAreas = formData
    .getAll("areas")
    .map((value) => String(value))
    .filter((value) => areaSet.has(value));
  const background = String(formData.get("background") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const programs = await listPrograms();
  const program = programs.find((item) => item.id === programId);
  const second = secondId ? programs.find((item) => item.id === secondId) : undefined;

  if (!program) return { ok: false, error: "Choose a program." };
  if (secondId && !second) {
    return { ok: false, error: "Choose a second program from the list." };
  }
  if (second && second.id === program.id) {
    return { ok: false, error: "Choose a different second program." };
  }
  if (!yearSet.has(years)) {
    return { ok: false, error: "Choose how long you have done this work." };
  }
  if (chosenAreas.length === 0) {
    return { ok: false, error: "Choose at least one area of experience." };
  }
  if (background.length < 20) {
    return { ok: false, error: "Describe your experience in a sentence or two." };
  }
  if (background.length > 2000 || note.length > 2000) {
    return { ok: false, error: "Keep each note under 2,000 characters." };
  }

  return {
    ok: true,
    value: {
      program: program.name,
      secondProgram: second?.name ?? "",
      years,
      areas: chosenAreas.join(", "),
      background,
      note,
    },
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
