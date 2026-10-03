"use server";

import { saveChat } from "@/lib/chats";

export type ChatState = {
  error: string;
};

export async function sendChat(formData: FormData): Promise<ChatState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const message = String(formData.get("message") ?? "").trim();

  if (name.length < 2) return { error: "Enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email." };
  }
  if (message.length < 2) return { error: "Write a short note." };
  if (message.length > 2000) {
    return { error: "Keep the note under 2,000 characters." };
  }

  await saveChat({ name, email, message });
  return { error: "" };
}
