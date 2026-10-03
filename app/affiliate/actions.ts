"use server";

import { saveApplication } from "@/lib/applications";
import { listPrograms } from "@/lib/programs";

export type ApplicationState = {
  error: string;
  ok: boolean;
};

export async function sendApplication(
  _state: ApplicationState,
  formData: FormData,
): Promise<ApplicationState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const programId = String(formData.get("program") ?? "").trim();
  const secondId = String(formData.get("second") ?? "").trim();
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
  if (!program) return { error: "Choose a program.", ok: false };
  if (secondId && !second) {
    return { error: "Choose a second program from the list.", ok: false };
  }
  if (second && second.id === program.id) {
    return { error: "Choose a different second program.", ok: false };
  }
  if (note.length > 2000) {
    return { error: "Keep the note under 2,000 characters.", ok: false };
  }

  await saveApplication({
    name,
    email,
    program: program.name,
    secondProgram: second?.name ?? "",
    note,
  });
  return { error: "", ok: true };
}
