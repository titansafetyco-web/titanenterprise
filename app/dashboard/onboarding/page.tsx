import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).leaderboard} · ${site.name}` };
}

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/onboarding");
  redirect("/dashboard/leaderboard");
}
