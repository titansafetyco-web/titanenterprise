import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardOverview } from "@/components/dashboard-overview";
import { MemberOverview } from "@/components/member-overview";
import { listApplications } from "@/lib/applications";
import { getCurrentUser, listProfiles } from "@/lib/auth";
import { listChats } from "@/lib/chats";
import { contactChoices } from "@/lib/i18n/catalog";
import { localizeError } from "@/lib/i18n/errors";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { listChosenJobs } from "@/lib/jobs";
import { listMessages } from "@/lib/messages";
import { listOwnPayouts, loadWallet } from "@/lib/wallet";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).overview} · ${site.name}` };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const locale = await getLocale();
  const t = ui(locale);
  if (user.role !== "admin") {
    const [jobs, applications, wallet, payouts] = await Promise.all([
      listChosenJobs(),
      listApplications(),
      loadWallet(),
      listOwnPayouts(),
    ]);
    const error = [jobs.error, applications.error, wallet.error, payouts.error].filter(Boolean)[0] ?? "";
    return (
      <MemberOverview
        name={user.name}
        balanceCents={wallet.balanceCents}
        payouts={payouts.items}
        jobs={jobs.items}
        applications={applications.items}
        history={wallet.history}
        error={error ? localizeError(locale, error) : ""}
      />
    );
  }

  const messages = await listMessages();
  const chats = await listChats();
  const applications = await listApplications();
  const jobs = await listChosenJobs();
  const profiles = await listProfiles();
  const memberCount = profiles.error
    ? null
    : profiles.items.filter(
        (item) =>
          item.role === "admin" ||
          item.role === "team" ||
          item.role === "affiliate" ||
          item.role === "agent",
      ).length;
  const topic = (value: string) =>
    contactChoices(locale).find((item) => item.value === value)?.label ?? value;
  const activity = [
    ...jobs.items.map((job) => ({
      id: `job-${job.id}`,
      at: job.selectedAt,
      kind: "job" as const,
      title: job.title,
    })),
    ...messages.items.map((item) => ({
      id: `message-${item.id}`,
      at: item.createdAt,
      kind: "message" as const,
      title: topic(item.interest),
    })),
    ...chats.items.map((item) => ({
      id: `chat-${item.id}`,
      at: item.createdAt,
      kind: "chat" as const,
      title: "",
    })),
    ...applications.items.map((item) => ({
      id: `form-${item.id}`,
      at: item.createdAt,
      kind: "onboarding" as const,
      title: item.program,
    })),
  ];

  return (
    <>
      <p className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-accent">
        {user.name}
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">
        {t.dashboard}
      </h1>
      <DashboardOverview
        jobs={jobs.error ? [] : jobs.items}
        error={jobs.error ? localizeError(locale, jobs.error) : ""}
        activity={activity}
        memberCount={memberCount}
      />
    </>
  );
}
