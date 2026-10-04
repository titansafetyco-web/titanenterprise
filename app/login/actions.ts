"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  accountRole,
  safeNext,
  signInAccount,
  signOutAccount,
  signUpAccount,
} from "@/lib/auth";
import { formatPhone, phoneDigits } from "@/lib/phone";
import { rememberCookie, rememberEmailCookie, rememberedEmail, withRemember } from "@/lib/supabase/remember";

export type AuthState = {
  error: string;
  message: string;
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
  const remember = formData.get("remember") === "1";
  const result = await withRemember(remember, () => signInAccount(email, password));
  if (!result.ok) return { error: result.error, message: "" };

  const store = await cookies();
  const emailCookie = {
    path: "/",
    sameSite: "lax" as const,
    httpOnly: true,
    maxAge: 400 * 24 * 60 * 60,
  };
  if (remember) {
    store.set(rememberCookie, "1", emailCookie);
    store.set(rememberEmailCookie, rememberedEmail(email), emailCookie);
  } else {
    store.set(rememberCookie, "", { path: "/", maxAge: 0 });
    store.set(rememberEmailCookie, "", { path: "/", maxAge: 0 });
  }
  redirect(readNext(formData));
}

export async function signup(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const phone = formatPhone(String(formData.get("phone") ?? ""));

  if (name.length < 2) return { error: "Enter your name.", message: "" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email.", message: "" };
  }
  if (phoneDigits(phone).length !== 10) {
    return { error: "Enter a 10-digit phone number.", message: "" };
  }
  if (password.length < 8) {
    return { error: "Use at least 8 characters for the password.", message: "" };
  }
  if (password !== String(formData.get("confirm") ?? "")) {
    return { error: "Passwords do not match.", message: "" };
  }

  const result = await signUpAccount({
    name,
    email,
    password,
    phone,
    role: accountRole(String(formData.get("role") ?? "")),
  });
  if (!result.ok) return { error: result.error, message: "" };
  if (result.approved) redirect(readNext(formData));
  return { error: "", message: result.message };
}

export async function signOut() {
  const store = await cookies();
  store.set(rememberCookie, "", { path: "/", maxAge: 0 });
  await signOutAccount();
  redirect("/");
}
