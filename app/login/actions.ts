"use server";

import { redirect } from "next/navigation";
import {
  clearSession,
  createUser,
  findUserByEmail,
  safeNext,
  setSession,
  verifyPassword,
} from "@/lib/auth";

export type AuthState = {
  error: string;
};

function readNext(formData: FormData) {
  const value = formData.get("next");
  return safeNext(typeof value === "string" ? value : undefined);
}

export async function login(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await findUserByEmail(email);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Email or password is incorrect." };
  }

  await setSession(user.id);
  redirect(readNext(formData));
}

export async function signup(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) {
    return { error: "Enter your name." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email." };
  }
  if (password.length < 8) {
    return { error: "Use at least 8 characters for the password." };
  }

  const result = await createUser({ name, email, password });
  if (!result.ok) return { error: result.error };

  await setSession(result.user.id);
  redirect(readNext(formData));
}

export async function signOut() {
  await clearSession();
  redirect("/");
}
