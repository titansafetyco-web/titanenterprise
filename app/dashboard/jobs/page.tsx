import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChosenJobs } from "@/components/chosen-jobs";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { listChosenJobs } from "@/lib/jobs";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).yourJobs} · Titan Safety Co.` };
}

export default async function JobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/jobs");
  const jobs = await listChosenJobs();
  return <ChosenJobs jobs={jobs.items} error={jobs.error} />;
}
