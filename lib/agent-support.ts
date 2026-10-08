import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { databaseMessage, supabaseConfigured } from "@/lib/supabase/env";

export type TicketStatus = "open" | "working" | "waiting" | "resolved";

export type SupportNote = {
  id: string;
  body: string;
  mine: boolean;
  at: string;
};

export type SupportThread = {
  id: string;
  number: number;
  agentId: string;
  name: string;
  role: string;
  subject: string;
  status: TicketStatus;
  preview: string;
  updatedAt: string;
  unread: number;
  messages: SupportNote[];
};

export type SupportDesk = {
  admin: boolean;
  unread: number;
  openCount: number;
  threads: SupportThread[];
  error: string;
};

const empty: SupportDesk = { admin: false, unread: 0, openCount: 0, threads: [], error: "" };

type ThreadRow = {
  id: string;
  number: number;
  agent_id: string;
  subject: string;
  status: string;
  agent_read_at: string;
  admin_read_at: string;
  updated_at: string;
};

type MessageRow = {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

function ticketStatus(value: string): TicketStatus {
  if (value === "working" || value === "waiting" || value === "resolved") return value;
  return "open";
}

const statusRank: Record<TicketStatus, number> = { open: 0, working: 1, waiting: 2, resolved: 3 };

export async function loadAgentSupport(): Promise<SupportDesk> {
  if (!supabaseConfigured()) return { ...empty, error: databaseMessage };
  const user = await getCurrentUser();
  if (!user) return { ...empty, error: "Your account cannot use support chat." };

  const supabase = await createClient();
  if (!supabase) return { ...empty, error: databaseMessage };

  const admin = user.role === "admin";
  let threadQuery = supabase
    .from("agent_threads")
    .select("id, number, agent_id, subject, status, agent_read_at, admin_read_at, updated_at")
    .order("updated_at", { ascending: false });
  if (!admin) threadQuery = threadQuery.eq("agent_id", user.id);

  const threads = await threadQuery;
  if (threads.error) return { ...empty, admin, error: "Support chat could not be loaded." };

  const rows = (threads.data ?? []) as ThreadRow[];
  if (rows.length === 0) return { ...empty, admin };

  const messages = await supabase
    .from("agent_messages")
    .select("id, thread_id, sender_id, body, created_at")
    .in(
      "thread_id",
      rows.map((row) => row.id),
    )
    .order("created_at", { ascending: true });
  if (messages.error) return { ...empty, admin, error: "Support chat could not be loaded." };

  const names = new Map<string, { name: string; role: string }>();
  if (admin) {
    const profiles = await supabase
      .from("profiles")
      .select("id, name, role")
      .in(
        "id",
        rows.map((row) => row.agent_id),
      );
    for (const profile of profiles.data ?? []) {
      names.set(profile.id, { name: profile.name, role: profile.role });
    }
  }

  const notes = new Map<string, SupportNote[]>();
  for (const row of (messages.data ?? []) as MessageRow[]) {
    const list = notes.get(row.thread_id) ?? [];
    list.push({
      id: row.id,
      body: row.body,
      mine: row.sender_id === user.id,
      at: row.created_at,
    });
    notes.set(row.thread_id, list);
  }

  const mapped = rows
    .map((row) => {
      const threadNotes = notes.get(row.id) ?? [];
      const readAt = new Date(admin ? row.admin_read_at : row.agent_read_at).getTime();
      const unread = ((messages.data ?? []) as MessageRow[]).filter(
        (note) =>
          note.thread_id === row.id &&
          note.sender_id !== user.id &&
          new Date(note.created_at).getTime() > readAt,
      ).length;
      const profile = names.get(row.agent_id);
      const status = ticketStatus(row.status);
      return {
        id: row.id,
        number: row.number,
        agentId: row.agent_id,
        name: profile?.name || user.name,
        role: profile?.role || user.role,
        subject: row.subject,
        status,
        preview: threadNotes.at(-1)?.body ?? "",
        updatedAt: row.updated_at,
        unread,
        messages: threadNotes,
      };
    })
    .sort((a, b) => statusRank[a.status] - statusRank[b.status] || +new Date(b.updatedAt) - +new Date(a.updatedAt));

  return {
    admin,
    unread: mapped.reduce((total, thread) => total + (thread.status === "resolved" ? 0 : thread.unread), 0),
    openCount: mapped.filter((thread) => thread.status === "open").length,
    threads: mapped,
    error: "",
  };
}
