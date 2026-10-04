"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { sendMailbox, syncInbox } from "@/lib/mail";
import { createClient } from "@/lib/supabase/server";
import { databaseMessage } from "@/lib/supabase/env";

export type ReplyState = { error: string };

export async function replyToTicket(_state: ReplyState, formData: FormData): Promise<ReplyState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { error: "The reply could not be sent." };
  }
  const threadId = String(formData.get("thread") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(threadId)) {
    return { error: "The reply could not be sent." };
  }
  if (message.length < 2) return { error: "Write a short note." };
  if (message.length > 2000) return { error: "Keep the note under 2,000 characters." };

  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage };
  const existing = await supabase.from("chats").select("email").eq("thread_id", threadId).limit(1).maybeSingle();
  if (existing.error || !existing.data) return { error: "The reply could not be sent." };

  const saved = await supabase.from("chats").insert({
    name: user.name,
    email: existing.data.email,
    message,
    user_id: user.id,
    from_staff: true,
    thread_id: threadId,
  });
  if (saved.error) return { error: "The reply could not be sent." };
  revalidatePath("/dashboard/messages");
  return { error: "" };
}

export async function replyByEmail(formData: FormData): Promise<string> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return "The email could not be sent.";
  }
  const kind = String(formData.get("kind") ?? "");
  const id = String(formData.get("id") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (message.length < 2) return "Write a short note.";
  if (message.length > 8000) return "Keep the note under 2,000 characters.";
  const supabase = await createClient();
  if (!supabase) return databaseMessage;

  let to = "";
  let subject = "";
  if (kind === "mailbox") {
    const row = await supabase
      .from("mailbox_messages")
      .select("direction, from_email, to_email, subject")
      .eq("id", id)
      .maybeSingle();
    if (row.error || !row.data) return "The email could not be sent.";
    to = row.data.direction === "out" ? row.data.to_email : row.data.from_email;
    subject = row.data.subject?.toLowerCase().startsWith("re:") ? row.data.subject : `Re: ${row.data.subject || ""}`.trim();
  } else if (kind === "contact") {
    const row = await supabase.from("messages").select("email, interest").eq("id", id).maybeSingle();
    if (row.error || !row.data) return "The email could not be sent.";
    to = row.data.email;
    subject = row.data.interest?.toLowerCase().startsWith("re:") ? row.data.interest : `Re: ${row.data.interest || ""}`.trim();
  } else {
    return "The email could not be sent.";
  }

  const sent = await sendMailbox({ to, subject, body: message });
  if (sent) return sent;
  revalidatePath("/dashboard/messages");
  return "";
}

export async function forwardEmail(formData: FormData): Promise<string> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return "The email could not be sent.";
  }
  const kind = String(formData.get("kind") ?? "");
  const id = String(formData.get("id") ?? "");
  const to = String(formData.get("to") ?? "").trim().toLowerCase();
  const note = String(formData.get("message") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || to.length > 254) return "Enter a valid email.";
  if (note.length > 2000) return "Keep the note under 2,000 characters.";
  const supabase = await createClient();
  if (!supabase) return databaseMessage;

  let fromName = "";
  let fromEmail = "";
  let subject = "";
  let body = "";
  if (kind === "mailbox") {
    const row = await supabase
      .from("mailbox_messages")
      .select("from_name, from_email, subject, body")
      .eq("id", id)
      .maybeSingle();
    if (row.error || !row.data) return "The email could not be sent.";
    fromName = row.data.from_name || row.data.from_email;
    fromEmail = row.data.from_email;
    subject = row.data.subject || "";
    body = row.data.body || "";
  } else if (kind === "contact") {
    const row = await supabase.from("messages").select("name, email, interest, message").eq("id", id).maybeSingle();
    if (row.error || !row.data) return "The email could not be sent.";
    fromName = row.data.name;
    fromEmail = row.data.email;
    subject = row.data.interest || "";
    body = row.data.message || "";
  } else {
    return "The email could not be sent.";
  }

  const quoted = `From: ${fromName} <${fromEmail}>\nSubject: ${subject}\n\n${body}`;
  const sent = await sendMailbox({
    to,
    subject: subject.toLowerCase().startsWith("fwd:") ? subject : `Fwd: ${subject}`.trim(),
    body: note ? `${note}\n\n${quoted}` : quoted,
  });
  if (sent) return sent;
  revalidatePath("/dashboard/messages");
  return "";
}

const noteId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function sendComposedEmail(formData: FormData): Promise<string> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return "The email could not be sent.";
  }
  const to = String(formData.get("to") ?? "").trim().toLowerCase();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const draft = String(formData.get("draft") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || to.length > 254) return "Enter a valid email.";
  if (message.length < 2) return "Write a short note.";
  if (message.length > 8000 || subject.length > 300) return "Keep the note under 2,000 characters.";
  const sent = await sendMailbox({ to, subject, body: message });
  if (sent) return sent;
  const supabase = await createClient();
  if (supabase && noteId.test(draft)) {
    await supabase.rpc("delete_mailbox_note", { note_kind: "draft", row_id: draft });
  }
  revalidatePath("/dashboard/messages");
  return "";
}

export async function saveDraft(formData: FormData): Promise<string> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return "The draft could not be saved.";
  }
  const to = String(formData.get("to") ?? "").trim().toLowerCase();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const draft = String(formData.get("draft") ?? "");
  if (!to && !subject && !message) return "Write a short note.";
  if (to && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || to.length > 254)) return "Enter a valid email.";
  if (message.length > 8000 || subject.length > 300) return "Keep the note under 2,000 characters.";
  if (draft && !noteId.test(draft)) return "The draft could not be saved.";
  const supabase = await createClient();
  if (!supabase) return databaseMessage;
  const saved = await supabase.rpc("save_mailbox_draft", {
    draft_id: draft || null,
    recipient_email: to,
    mail_subject: subject,
    mail_body: message,
  });
  if (saved.error) return "The draft could not be saved.";
  revalidatePath("/dashboard/messages");
  return "";
}

export async function deleteEmail(formData: FormData): Promise<string> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return "The email could not be deleted.";
  }
  const kind = String(formData.get("kind") ?? "");
  const id = String(formData.get("id") ?? "");
  if ((kind !== "mailbox" && kind !== "contact" && kind !== "draft") || !noteId.test(id)) {
    return "The email could not be deleted.";
  }
  const supabase = await createClient();
  if (!supabase) return databaseMessage;
  const saved = await supabase.rpc("delete_mailbox_note", { note_kind: kind, row_id: id });
  if (saved.error) return "The email could not be deleted.";
  revalidatePath("/dashboard/messages");
  return "";
}

export async function refreshMailbox(): Promise<string> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return "The mailbox could not be reached.";
  }
  const error = await syncInbox(true);
  revalidatePath("/dashboard/messages");
  return error;
}

export async function setSupportPresence(formData: FormData): Promise<string> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return "The status could not be saved.";
  }
  const supabase = await createClient();
  if (!supabase) return databaseMessage;
  const enabled = formData.get("online") === "1";
  const saved = await supabase.rpc("set_support_online", { enabled });
  if (saved.error) return "The status could not be saved.";
  revalidatePath("/dashboard/messages");
  revalidatePath("/");
  revalidatePath("/maintenance");
  return "";
}

export async function clearSupportBox(formData: FormData): Promise<string> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return "These could not be cleared.";
  }
  const box = String(formData.get("box") ?? "");
  if (box !== "emails" && box !== "forms" && box !== "chats") {
    return "These could not be cleared.";
  }
  const supabase = await createClient();
  if (!supabase) return databaseMessage;
  const saved = await supabase.rpc("clear_support_box", { box });
  if (saved.error) return "These could not be cleared.";
  revalidatePath("/dashboard/messages");
  return "";
}
