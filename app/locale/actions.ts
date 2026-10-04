"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function setLocale(formData: FormData) {
  const locale = formData.get("locale") === "es" ? "es" : "en";
  const jar = await cookies();
  jar.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
