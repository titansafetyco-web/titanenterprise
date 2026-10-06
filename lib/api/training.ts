import { mockTraining } from "@/data/mockDashboard";
import type { Locale } from "@/lib/i18n/locale";

export async function listTraining(locale: Locale) {
  return { items: mockTraining(locale), error: "" };
}

export async function completeTraining(): Promise<{ error: string }> {
  // TODO: store training progress when a training table exists.
  return { error: "Training progress is not saved yet." };
}
