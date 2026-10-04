import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import nodemailer from "nodemailer";
import { site } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export type MailNote = {
  id: string;
  direction: "in" | "out";
  name: string;
  email: string;
  subject: string;
  body: string;
  createdAt: string;
};

type MailRow = {
  id: string;
  direction: "in" | "out";
  from_name: string;
  from_email: string;
  to_email: string;
  subject: string;
  body: string;
  created_at: string;
};

function account() {
  return {
    user: process.env.MAIL_USER || site.contactEmail,
    password: process.env.MAIL_PASSWORD || "",
    smtpHost: process.env.MAIL_SMTP_HOST || "smtp.hostinger.com",
    smtpPort: Number(process.env.MAIL_SMTP_PORT || 465),
    imapHost: process.env.MAIL_IMAP_HOST || "imap.hostinger.com",
    imapPort: Number(process.env.MAIL_IMAP_PORT || 993),
  };
}

export function mailboxReady() {
  return Boolean(account().password);
}

function plain(value: { text?: string; html?: string | false }) {
  const source = value.text?.trim()
    ? value.text
    : typeof value.html === "string"
      ? value.html.replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")
      : "";
  return source
    .replace(/[\u200B-\u200D\uFEFF\u034F\u00AD\u2060]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);
}

async function saveNote(input: {
  key: string;
  direction: "in" | "out";
  name: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  at: string;
}) {
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.rpc("save_mailbox_message", {
    mail_key: input.key,
    mail_direction: input.direction,
    sender_name: input.name,
    sender_email: input.from,
    recipient_email: input.to,
    mail_subject: input.subject,
    mail_body: input.body,
    mail_at: input.at,
  });
}

async function pullFolder(client: ImapFlow, folder: string, direction: "in" | "out") {
  const lock = await client.getMailboxLock(folder);
  try {
    const mailbox = client.mailbox;
    const exists = mailbox && typeof mailbox === "object" ? mailbox.exists : 0;
    if (!exists) return;
    const start = Math.max(1, exists - 39);
    for await (const message of client.fetch(`${start}:*`, { uid: true, source: true })) {
      if (!message.source) continue;
      const parsed = await simpleParser(message.source);
      const from = parsed.from?.value[0];
      const recipients = parsed.to ? (Array.isArray(parsed.to) ? parsed.to : [parsed.to]) : [];
      const toEmail = recipients[0]?.value[0]?.address?.trim().toLowerCase() || account().user;
      const fromEmail = from?.address?.trim().toLowerCase() || "";
      if (!fromEmail) continue;
      const at = (parsed.date ?? new Date()).toISOString();
      await saveNote({
        key: parsed.messageId || `${folder}-${message.uid}`,
        direction,
        name: from?.name || "",
        from: fromEmail,
        to: toEmail,
        subject: parsed.subject || "",
        body: plain(parsed),
        at,
      });
    }
  } finally {
    lock.release();
  }
}

export async function syncInbox(force = false) {
  const mailbox = account();
  if (!mailbox.password) return "The mailbox for admin@titansafetystore.com is not connected yet.";
  const supabase = await createClient();
  if (!supabase) return "";
  const due = await supabase.rpc("claim_mailbox_sync");
  if (!force && (due.error || due.data !== true)) return "";

  const client = new ImapFlow({
    host: mailbox.imapHost,
    port: mailbox.imapPort,
    secure: true,
    auth: { user: mailbox.user, pass: mailbox.password },
    logger: false,
    connectionTimeout: 12000,
    greetingTimeout: 12000,
  });

  try {
    await client.connect();
    await pullFolder(client, "INBOX", "in");
    for (const folder of ["INBOX.Sent", "Sent"]) {
      try {
        await pullFolder(client, folder, "out");
        break;
      } catch {
        // Hostinger names this folder INBOX.Sent. Inbox mail still lands.
      }
    }
    await client.logout();
  } catch {
    return "The mailbox could not be reached.";
  }
  return "";
}

export async function listMailbox() {
  const supabase = await createClient();
  if (!supabase) return [] as MailNote[];
  const { data, error } = await supabase
    .from("mailbox_messages")
    .select("id, direction, from_name, from_email, to_email, subject, body, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error || !data) return [] as MailNote[];
  return (data as MailRow[]).map((row) => ({
    id: row.id,
    direction: row.direction,
    name: row.direction === "out" ? row.to_email : row.from_name || row.from_email,
    email: row.direction === "out" ? row.to_email : row.from_email,
    subject: row.subject,
    body: row.body,
    createdAt: row.created_at,
  }));
}

export type MailDraft = {
  id: string;
  email: string;
  subject: string;
  body: string;
  updatedAt: string;
};

export async function listDrafts() {
  const supabase = await createClient();
  if (!supabase) return [] as MailDraft[];
  const { data, error } = await supabase
    .from("mailbox_drafts")
    .select("id, to_email, subject, body, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error || !data) return [] as MailDraft[];
  return data.map((row) => ({
    id: row.id,
    email: row.to_email,
    subject: row.subject,
    body: row.body,
    updatedAt: row.updated_at,
  }));
}

export async function sendMailbox(input: {
  to: string;
  subject: string;
  body: string;
  html?: string;
  replyTo?: string;
  storedBody?: string;
}) {
  const mailbox = account();
  if (!mailbox.password) return "The mailbox for admin@titansafetystore.com is not connected yet.";
  const transport = nodemailer.createTransport({
    host: mailbox.smtpHost,
    port: mailbox.smtpPort,
    secure: mailbox.smtpPort === 465,
    auth: { user: mailbox.user, pass: mailbox.password },
    connectionTimeout: 12000,
    greetingTimeout: 12000,
  });
  try {
    const sent = await transport.sendMail({
      from: `"Titan Safety Co." <${mailbox.user}>`,
      to: input.to,
      replyTo: input.replyTo,
      subject: input.subject,
      text: input.body,
      html: input.html,
    });
    await saveNote({
      key: sent.messageId || `sent-${crypto.randomUUID()}`,
      direction: "out",
      name: "Titan Safety Co.",
      from: mailbox.user,
      to: input.to,
      subject: input.subject,
      body: input.storedBody || input.body,
      at: new Date().toISOString(),
    });
  } catch {
    return "The email could not be sent.";
  }
  return "";
}
