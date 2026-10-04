"use server";

import { redirect } from "next/navigation";
import { databaseMessage } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type PasswordState = {
  error: string;
  message: string;
};

export async function updatePassword(
  _state: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { error: "Use at least 8 characters for the password.", message: "" };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match.", message: "" };
  }

  const supabase = await createClient();
  if (!supabase) return { error: databaseMessage, message: "" };

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return {
      error: "This reset link is no longer valid. Request a new one.",
      message: "",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "The password could not be saved.", message: "" };

  redirect("/dashboard");
}
