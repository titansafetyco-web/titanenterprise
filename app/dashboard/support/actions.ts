"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { loadAgentSupport, type TicketStatus } from "@/lib/agent-support";
import { createClient } from "@/lib/supabase/server";
import { databaseMessage } from "@/lib/supabase/env";

const idPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const known = [
  "Write a short note.",
  "Keep the note under 2,000 characters.",
  "Enter a subject.",
  "Keep the subject under 80 characters.",
  "That ticket does not exist.",
  "That ticket could not be updated.",
  "Your account cannot use support chat.",
];

function supportError(message: string) {
  return known.find((item) => message.includes(item)) ?? "The support message could not be sent.";
}

function noteError(body: string) {
  if (body.length < 2) return "Write a short note.";
  if (body.length > 2000) return "Keep the note under 2,000 characters.";
  return "";
}

export async function refreshAgentSupport() {
  return loadAgentSupport();
}

export async function openAgentTicket(input: { subject: string; body: string }) {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") return { error: "Your account cannot use support chat.", id: "" };

  const subject = input.subject.trim();
  const body = input.body.trim();
  if (subject.length < 2) return { error: "Enter a subject.", id: "" };
  if (subject.length > 80) return { error: "Keep the subject under 80 characters.", id: "" };
  const invalid = noteError(body);
  if (invalid) return { error: invalid, id: "" };

  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage, id: "" };

  const saved = await supabase.rpc("open_agent_ticket", { subject, note: body });
  if (saved.error) return { error: supportError(saved.error.message), id: "" };

  revalidatePath("/dashboard/messages");
  return { error: "", id: String(saved.data ?? "") };
}

export async function replyAgentTicket(input: { threadId: string; body: string }) {
  const user = await getCurrentUser();
  if (!user) return { error: "Your account cannot use support chat." };
  if (!idPattern.test(input.threadId)) return { error: "That ticket does not exist." };

  const body = input.body.trim();
  const invalid = noteError(body);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage };

  const saved = await supabase.rpc("reply_agent_ticket", { thread: input.threadId, note: body });
  if (saved.error) return { error: supportError(saved.error.message) };

  revalidatePath("/dashboard/messages");
  return { error: "" };
}

export async function setAgentTicketStatus(threadId: string, status: TicketStatus) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { error: "Your account cannot use support chat." };
  if (!idPattern.test(threadId)) return { error: "That ticket does not exist." };
  if (status !== "open" && status !== "working" && status !== "waiting" && status !== "resolved") {
    return { error: "That ticket could not be updated." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage };

  const saved = await supabase.rpc("set_agent_ticket_status", { thread: threadId, next: status });
  if (saved.error) return { error: supportError(saved.error.message) };

  revalidatePath("/dashboard/messages");
  return { error: "" };
}

export async function markAgentSupportRead(threadId: string) {
  if (!idPattern.test(threadId)) return;
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.rpc("mark_agent_support_read", { thread: threadId });
}
