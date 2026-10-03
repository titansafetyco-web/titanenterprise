"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { addProgram, removeProgram } from "@/lib/programs";

export type ProgramState = {
  error: string;
};

async function requireAdmin() {
  if (!(await getCurrentUser())) redirect("/login?next=/admin");
}

export async function addProgramAction(
  _state: ProgramState,
  formData: FormData,
): Promise<ProgramState> {
  await requireAdmin();
  const result = await addProgram(String(formData.get("name") ?? ""));
  revalidatePath("/admin");
  revalidatePath("/affiliate");
  return result;
}

export async function removeProgramAction(formData: FormData) {
  await requireAdmin();
  await removeProgram(String(formData.get("id") ?? ""));
  revalidatePath("/admin");
  revalidatePath("/affiliate");
}
