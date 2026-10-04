import { cookies } from "next/headers";

export type Locale = "en" | "es";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  return jar.get("locale")?.value === "es" ? "es" : "en";
}
