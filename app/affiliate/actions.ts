"use server";

import { readOnboarding, saveApplication } from "@/lib/applications";
import { formatPhone, phoneDigits } from "@/lib/phone";

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
  const phone = formatPhone(String(formData.get("phone") ?? ""));

  if (name.length < 2) return { error: "Enter your name.", ok: false };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email.", ok: false };
  }
  if (phoneDigits(phone).length !== 10) {
    return { error: "Enter a 10-digit phone number.", ok: false };
  }

  const onboarding = await readOnboarding(formData);
  if (!onboarding.ok) return { error: onboarding.error, ok: false };

  const saved = await saveApplication({
    name,
    email,
    phone,
    ...onboarding.value,
  });
  if (!saved.ok) return { error: saved.error, ok: false };
  return { error: "", ok: true };
}
