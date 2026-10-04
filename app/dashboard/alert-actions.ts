"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { markNavSeen } from "@/lib/alerts";

export async function markNavSeenAction(section: "messages" | "wallet") {
  const user = await getCurrentUser();
  if (!user) return;
  if (section !== "messages" && section !== "wallet") return;
  await markNavSeen(user.id, section);
  revalidatePath("/dashboard", "layout");
}
