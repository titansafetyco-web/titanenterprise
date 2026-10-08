import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JobReviews, type JobReviewItem } from "@/components/job-reviews";
import { getCurrentUser, listProfiles } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { timerTotalSeconds } from "@/lib/job-timer";
import { listSelections } from "@/lib/jobs";
import { site } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).jobReviews} · ${site.name}` };
}

async function loadTimerSeconds() {
  const supabase = await createClient();
  const seconds = new Map<string, number>();
  if (!supabase) return seconds;
  const { data, error } = await supabase.from("job_timers").select("user_id, job_id, elapsed_seconds, started_at");
  if (error || !data) return seconds;
  const now = Date.now();
  for (const row of data as {
    user_id: string;
    job_id: string;
    elapsed_seconds: number | null;
    started_at: string | null;
  }[]) {
    seconds.set(
      `${row.user_id}:${row.job_id}`,
      timerTotalSeconds(row.elapsed_seconds ?? 0, row.started_at ?? "", now),
    );
  }
  return seconds;
}

export default async function JobReviewsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/reviews");
  if (user.role !== "admin") redirect("/dashboard");

  const [selections, profiles, timers] = await Promise.all([listSelections(), listProfiles(), loadTimerSeconds()]);
  const names = new Map(profiles.items.map((profile) => [profile.id, profile.name]));
  const items: JobReviewItem[] = selections.items.map((item) => ({
    userId: item.userId,
    jobId: item.jobId,
    name: names.get(item.userId) ?? "",
    title: item.title,
    pay: item.pay,
    payCents: item.payCents,
    status: item.status,
    seconds: timers.get(`${item.userId}:${item.jobId}`) ?? 0,
  }));

  return <JobReviews items={items} error={selections.error || profiles.error} />;
}
