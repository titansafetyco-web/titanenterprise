"use server";

import { saveApplication } from "@/lib/applications";
import { formatPhone, phoneDigits } from "@/lib/phone";
import { listPrograms } from "@/lib/programs";

export type ApplicationState = {
  error: string;
  ok: boolean;
};

const years = new Set([
  "Less than 1 year",
  "1 to 3 years",
  "3 to 5 years",
  "More than 5 years",
]);

const areas = new Set([
  "Lead scouting",
  "Audience research",
  "Digital campaigns",
  "Onboarding support",
]);

export async function sendApplication(
  _state: ApplicationState,
  formData: FormData,
): Promise<ApplicationState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = formatPhone(String(formData.get("phone") ?? ""));
  const programId = String(formData.get("program") ?? "").trim();
  const secondId = String(formData.get("second") ?? "").trim();
  const experienceYears = String(formData.get("years") ?? "").trim();
  const chosenAreas = formData
    .getAll("areas")
    .map((value) => String(value))
    .filter((value) => areas.has(value));
  const background = String(formData.get("background") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const programs = await listPrograms();
  const program = programs.find((item) => item.id === programId);
  const second = secondId
    ? programs.find((item) => item.id === secondId)
    : undefined;

  if (name.length < 2) return { error: "Enter your name.", ok: false };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email.", ok: false };
  }
  if (phoneDigits(phone).length !== 10) {
    return { error: "Enter a 10-digit phone number.", ok: false };
  }
  if (!program) return { error: "Choose a program.", ok: false };
  if (secondId && !second) {
    return { error: "Choose a second program from the list.", ok: false };
  }
  if (second && second.id === program.id) {
    return { error: "Choose a different second program.", ok: false };
  }
  if (!years.has(experienceYears)) {
    return { error: "Choose how long you have done this work.", ok: false };
  }
  if (chosenAreas.length === 0) {
    return { error: "Choose at least one area of experience.", ok: false };
  }
  if (background.length < 20) {
    return { error: "Describe your experience in a sentence or two.", ok: false };
  }
  if (background.length > 2000 || note.length > 2000) {
    return { error: "Keep each note under 2,000 characters.", ok: false };
  }

  const saved = await saveApplication({
    name,
    email,
    phone,
    program: program.name,
    secondProgram: second?.name ?? "",
    years: experienceYears,
    areas: chosenAreas.join(", "),
    background,
    note,
  });
  if (!saved.ok) return { error: saved.error, ok: false };
  return { error: "", ok: true };
}
