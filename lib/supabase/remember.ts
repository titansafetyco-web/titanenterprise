import { AsyncLocalStorage } from "node:async_hooks";

export const rememberCookie = "titan-remember";
export const rememberEmailCookie = "titan-remember-email";

export function rememberedEmail(value: string | undefined) {
  const email = (value ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return "";
  return email;
}

const choice = new AsyncLocalStorage<boolean>();

export function withRemember<T>(remember: boolean, run: () => Promise<T>) {
  return choice.run(remember, run);
}

export function remembered(cookieValue: string | undefined) {
  const stored = choice.getStore();
  if (stored !== undefined) return stored;
  return cookieValue === "1";
}

export function authCookieOptions<T extends { maxAge?: number; expires?: Date }>(
  name: string,
  options: T,
  remember: boolean,
) {
  if (remember || !name.includes("-auth-token")) return options;
  const next = { ...options };
  delete next.maxAge;
  delete next.expires;
  return next;
}
