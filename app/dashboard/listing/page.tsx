import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AddJobForm } from "@/components/add-job-form";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).addJob} · Titan Safety Co.` };
}

export default async function ListingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/listing");
  if (user.role !== "admin") redirect("/dashboard");
  return <AddJobForm />;
}
