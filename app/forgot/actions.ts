"use server";

import { headers } from "next/headers";
import { databaseMessage } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type ResetState = {
  error: string;
  message: string;
};

export async function requestReset(
  _state: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email.", message: "" };
  }

  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage, message: "" };

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${proto}://${host}` : "";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm`,
  });

  if (error && !/not found|user/i.test(error.message)) {
    return { error: "The reset link could not be sent.", message: "" };
  }

  return {
    error: "",
    message: "If an account uses that email, a reset link is on the way.",
  };
}
