import { currentUserId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { databaseMessage, supabaseConfigured } from "@/lib/supabase/env";

export type ChatNote = {
  id: string;
  name: string;
  email: string;
  message: string;
  fromStaff: boolean;
  threadId: string;
  createdAt: string;
};

type ChatRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  from_staff: boolean;
  thread_id: string;
  created_at: string;
};

function mapChat(row: ChatRow): ChatNote {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    fromStaff: row.from_staff,
    threadId: row.thread_id,
    createdAt: row.created_at,
  };
}

function unavailable(error: { message: string }) {
  return /relation|schema cache|does not exist/i.test(error.message);
}

export async function listChats() {
  if (!supabaseConfigured()) {
    return { items: [] as ChatNote[], error: databaseMessage };
  }
  const supabase = await createClient();
  if (!supabase) return { items: [] as ChatNote[], error: databaseMessage };

  const { data, error } = await supabase
    .from("chats")
    .select("id, name, email, message, from_staff, thread_id, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return {
      items: [] as ChatNote[],
      error: unavailable(error) ? databaseMessage : "Chat notes could not be loaded.",
    };
  }

  return { items: ((data ?? []) as ChatRow[]).map(mapChat), error: "" };
}

export async function saveChat(input: {
  name: string;
  email: string;
  message: string;
  threadId?: string;
}) {
  const supabase = await createClient();
  if (!supabase) return { ok: false as const, threadId: "", error: databaseMessage };

  const threadId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    input.threadId ?? "",
  )
    ? (input.threadId as string)
    : crypto.randomUUID();

  const { error } = await supabase.from("chats").insert({
    name: input.name,
    email: input.email,
    message: input.message,
    user_id: await currentUserId(),
    from_staff: false,
    thread_id: threadId,
  });

  if (error) {
    return {
      ok: false as const,
      threadId: "",
      error: unavailable(error) ? databaseMessage : "The note could not be sent.",
    };
  }
  return { ok: true as const, threadId, error: "" };
}

export type SupportLine = {
  id: string;
  name: string;
  message: string;
  fromStaff: boolean;
  createdAt: string;
};

export async function readSupportThread(threadId: string) {
  const supabase = await createClient();
  if (!supabase || !/^[0-9a-f-]{36}$/i.test(threadId)) return [] as SupportLine[];
  const { data, error } = await supabase.rpc("support_thread", { thread: threadId });
  if (error || !data) return [] as SupportLine[];
  return (data as { id: string; name: string; message: string; from_staff: boolean; created_at: string }[]).map(
    (row) => ({
      id: row.id,
      name: row.name,
      message: row.message,
      fromStaff: row.from_staff,
      createdAt: row.created_at,
    }),
  );
}

export async function ownSupportThread() {
  const supabase = await createClient();
  if (!supabase) return "";
  const { data, error } = await supabase.rpc("my_support_thread");
  if (error || typeof data !== "string") return "";
  return data;
}
