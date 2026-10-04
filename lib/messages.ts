import { currentUserId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { databaseMessage, supabaseConfigured } from "@/lib/supabase/env";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  interest: string;
  message: string;
  createdAt: string;
};

type MessageRow = {
  id: string;
  name: string;
  email: string;
  interest: string;
  message: string;
  created_at: string;
};

function mapMessage(row: MessageRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    interest: row.interest,
    message: row.message,
    createdAt: row.created_at,
  };
}

function unavailable(error: { message: string }) {
  return /relation|schema cache|does not exist/i.test(error.message);
}

export async function listMessages() {
  if (!supabaseConfigured()) {
    return { items: [] as ContactMessage[], error: databaseMessage };
  }
  const supabase = await createClient();
  if (!supabase) return { items: [] as ContactMessage[], error: databaseMessage };

  const { data, error } = await supabase
    .from("messages")
    .select("id, name, email, interest, message, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return {
      items: [] as ContactMessage[],
      error: unavailable(error) ? databaseMessage : "Messages could not be loaded.",
    };
  }

  return { items: ((data ?? []) as MessageRow[]).map(mapMessage), error: "" };
}

export async function saveMessage(input: Omit<ContactMessage, "id" | "createdAt">) {
  const supabase = await createClient();
  if (!supabase) return { ok: false as const, error: databaseMessage };

  const { error } = await supabase.from("messages").insert({
    name: input.name,
    email: input.email,
    interest: input.interest,
    message: input.message,
    user_id: await currentUserId(),
  });

  if (error) {
    return {
      ok: false as const,
      error: unavailable(error) ? databaseMessage : "The message could not be sent.",
    };
  }
  return { ok: true as const, error: "" };
}
