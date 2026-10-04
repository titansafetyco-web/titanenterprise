"use server";

import { ownSupportThread, readSupportThread, saveChat } from "@/lib/chats";
import { supportIsOnline } from "@/lib/maintenance";

export type ChatState = {
  error: string;
  threadId: string;
};

export async function sendChat(formData: FormData): Promise<ChatState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const message = String(formData.get("message") ?? "").trim();

  if (name.length < 2) return { error: "Enter your name.", threadId: "" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email.", threadId: "" };
  }
  if (message.length < 2) return { error: "Write a short note.", threadId: "" };
  if (message.length > 2000) {
    return { error: "Keep the note under 2,000 characters.", threadId: "" };
  }

  const saved = await saveChat({ name, email, message, threadId: String(formData.get("thread") ?? "") });
  if (!saved.ok) return { error: saved.error, threadId: "" };
  return { error: "", threadId: saved.threadId };
}

export async function supportPresence() {
  return supportIsOnline();
}

export async function openSupport(threadId: string) {
  const stored = /^[0-9a-f-]{36}$/i.test(threadId) ? threadId : await ownSupportThread();
  if (!stored) return { threadId: "", messages: [] as { id: string; fromStaff: boolean; text: string }[] };
  const messages = await readSupportThread(stored);
  return {
    threadId: stored,
    messages: messages.map((item) => ({ id: item.id, fromStaff: item.fromStaff, text: item.message })),
  };
}
