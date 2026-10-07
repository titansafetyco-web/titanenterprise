import { cache } from "react";
import { createClient as createAuthClient } from "@supabase/supabase-js";
import { sendAccountNotice } from "@/lib/account-mail";
import { ratingFromCompletions } from "@/lib/ratings";
import { createClient } from "@/lib/supabase/server";
import { databaseMessage, supabaseConfigured, supabaseUrl } from "@/lib/supabase/env";

export type AccountStatus = "pending" | "approved" | "denied";
export type AccountRole = "agent" | "affiliate" | "admin" | "team" | "member";

export function accountRole(value: string): AccountRole {
  if (
    value === "agent" ||
    value === "affiliate" ||
    value === "admin" ||
    value === "team" ||
    value === "member"
  ) {
    return value;
  }
  return "affiliate";
}

export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: AccountStatus;
  role: AccountRole;
  stars: number;
  avatarPath: string;
  birthDate: string;
  state: string;
  createdAt: string;
};

export function safeNext(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: AccountStatus;
  role: AccountRole;
  avatar_path: string;
  birth_date: string | null;
  state: string;
  created_at: string;
};

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    role: row.role,
    stars: 0,
    avatarPath: row.avatar_path ?? "",
    birthDate: row.birth_date ?? "",
    state: row.state ?? "",
    createdAt: row.created_at,
  };
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, name, email, phone, status, role, avatar_path, birth_date, state, created_at")
    .eq("id", userId)
    .maybeSingle();
  return data ? mapProfile(data as ProfileRow) : null;
}

export const getCurrentUser = cache(async function getCurrentUser() {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const profile = await getProfile(data.user.id);
  if (!profile || profile.status === "denied" || profile.status === "pending") return null;

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    role: profile.role,
    avatarPath: profile.avatarPath,
    birthDate: profile.birthDate,
    state: profile.state,
  };
});

export async function currentUserId() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function claimSubmissions() {
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.rpc("claim_my_submissions");
}

export async function listProfiles() {
  if (!supabaseConfigured()) return { items: [] as Profile[], error: databaseMessage };
  const supabase = await createClient();
  if (!supabase) return { items: [] as Profile[], error: databaseMessage };

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, phone, status, role, avatar_path, birth_date, state, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    const missing = /relation|schema cache|does not exist/i.test(error.message);
    return {
      items: [] as Profile[],
      error: missing ? databaseMessage : "Accounts could not be loaded.",
    };
  }

  const base = ((data ?? []) as ProfileRow[]).map(mapProfile);

  const doneSelections = await supabase
    .from("job_selections")
    .select("user_id")
    .eq("status", "done");
  const doneByUser = new Map<string, number>();
  if (!doneSelections.error) {
    for (const row of (doneSelections.data ?? []) as { user_id: string }[]) {
      doneByUser.set(row.user_id, (doneByUser.get(row.user_id) ?? 0) + 1);
    }
  }

  return {
    items: base.map((profile) => ({
      ...profile,
      stars: ratingFromCompletions(doneByUser.get(profile.id) ?? 0).stars,
    })),
    error: "",
  };
}

export async function setProfileStatus(id: string, status: AccountStatus, role?: AccountRole) {
  const supabase = await createClient();
  if (!supabase) return { ok: false as const, error: databaseMessage };

  const patch: { status: AccountStatus; role?: AccountRole } = { status };
  if (role) patch.role = role;
  const { error } = await supabase.from("profiles").update(patch).eq("id", id);
  if (error) return { ok: false as const, error: "That account could not be updated." };
  return { ok: true as const, error: "" };
}

export async function signUpAccount(input: {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: AccountRole;
  birth?: string;
  state?: string;
}) {
  const supabase = await createClient();
  if (!supabase) return { ok: false as const, error: databaseMessage };

  const signupRole = input.role === "agent" ? "agent" : "affiliate";
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { name: input.name, role: signupRole, phone: input.phone } },
  });

  if (error) {
    const taken = /already/i.test(error.message);
    return {
      ok: false as const,
      error: taken
        ? "An account with that email already exists."
        : "The account could not be created.",
    };
  }

  if (!data.user) {
    return { ok: false as const, error: "The account could not be created." };
  }

  if (input.birth || input.state) {
    await supabase.rpc("set_profile_details", {
      birth: input.birth ?? "",
      region: input.state ?? "",
    });
  }

  const created = await getProfile(data.user.id);
  if (!created || created.status !== "approved") {
    await supabase.auth.signOut();
    await sendAccountNotice({
      name: input.name,
      email: input.email,
      password: input.password,
      kind: "review",
    });
    return {
      ok: true as const,
      approved: false as const,
      message: "Your account is being reviewed. We will email you when it is approved.",
    };
  }

  await sendAccountNotice({
    name: input.name,
    email: input.email,
    password: input.password,
    kind: "approved",
  });

  if (!data.session) {
    const signedIn = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    if (signedIn.error || !signedIn.data.session) {
      return {
        ok: true as const,
        approved: false as const,
        message: "Account created. Sign in to open your dashboard.",
      };
    }
  }

  return { ok: true as const, approved: true as const };
}

export async function createMemberAccount(input: {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "team" | "member";
}) {
  if (!supabaseConfigured()) return { ok: false as const, error: databaseMessage };
  const supabase = createAuthClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { name: input.name, role: input.role, phone: input.phone } },
  });

  if (error) {
    const taken = /already/i.test(error.message);
    return {
      ok: false as const,
      error: taken
        ? "An account with that email already exists."
        : "The account could not be created.",
    };
  }

  if (!data.user) return { ok: false as const, error: "The account could not be created." };
  const approved = await setProfileStatus(data.user.id, "approved", input.role);
  if (!approved.ok) return { ok: false as const, error: approved.error };
  await sendAccountNotice({
    name: input.name,
    email: input.email,
    password: input.password,
    kind: "approved",
  });
  return { ok: true as const, error: "" };
}

export async function signInAccount(email: string, password: string) {
  const supabase = await createClient();
  if (!supabase) return { ok: false as const, error: databaseMessage };

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { ok: false as const, error: "Email or password is incorrect." };
  }

  const profile = await getProfile(data.user.id);
  if (!profile) {
    await supabase.auth.signOut();
    return { ok: false as const, error: "The account could not be created." };
  }
  if (profile.status === "pending") {
    await supabase.auth.signOut();
    return {
      ok: false as const,
      error: "Your account is being reviewed. We will email you when it is approved.",
    };
  }
  if (profile.status === "denied") {
    await supabase.auth.signOut();
    return { ok: false as const, error: "This account was not approved." };
  }

  return { ok: true as const, error: "" };
}

export async function signOutAccount() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
}
