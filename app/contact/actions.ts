"use server";

import { saveMessage } from "@/lib/messages";
import { contactTopics } from "@/lib/site";

export type ContactState = {
  error: string;
  ok: boolean;
};

const topics: readonly string[] = contactTopics;

export async function sendMessage(
  _state: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const interest = String(formData.get("interest") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (name.length < 2) return { error: "Enter your name.", ok: false };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email.", ok: false };
  }
  if (!topics.includes(interest)) return { error: "Choose a subject.", ok: false };
  if (message.length < 10) {
    return { error: "Write a short note, at least a sentence.", ok: false };
  }
  if (message.length > 2000) {
    return { error: "Keep the note under 2,000 characters.", ok: false };
  }

  await saveMessage({ name, email, interest, message });
  return { error: "", ok: true };
}
