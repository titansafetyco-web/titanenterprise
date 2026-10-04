import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardAnalytics } from "@/components/dashboard-analytics";
import { listApplications } from "@/lib/applications";
import { listProfiles, getCurrentUser } from "@/lib/auth";
import { listChats } from "@/lib/chats";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { listJobs, listSelections } from "@/lib/jobs";
import { listMessages } from "@/lib/messages";
import { listWalletRecords } from "@/lib/wallet";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).analytics} · Titan Safety Co.` };
}

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/analytics");
  if (user.role !== "admin") redirect("/dashboard");

  const [profiles, selections, catalog, applications, messages, chats, money] = await Promise.all([
    listProfiles(),
    listSelections(),
    listJobs(),
    listApplications(),
    listMessages(),
    listChats(),
    listWalletRecords(),
  ]);

  const received = new Map<string, number>();
  for (const row of money.received) {
    received.set(row.userId, (received.get(row.userId) ?? 0) + row.cents);
  }

  const users = profiles.items.map((profile) => {
    const chosen = selections.items.filter((item) => item.userId === profile.id);
    return {
      id: profile.id,
      name: profile.name,
      role: profile.role,
      status: profile.status,
      selected: chosen.length,
      done: chosen.filter((item) => item.status === "done").length,
      madeCents: received.get(profile.id) ?? 0,
    };
  });

  const jobs = catalog.items.map((job) => {
    const chosen = selections.items.filter((item) => item.jobId === job.id);
    return {
      id: job.id,
      title: job.title,
      pay: job.pay,
      processing: chosen.filter((item) => item.status === "processing").length,
      done: chosen.filter((item) => item.status === "done").length,
      incomplete: chosen.filter((item) => item.status === "incomplete").length,
    };
  });

  const activity = [
    ...selections.items.map((item) => ({ at: item.selectedAt, kind: "job" as const })),
    ...messages.items.map((item) => ({ at: item.createdAt, kind: "message" as const })),
    ...chats.items.map((item) => ({ at: item.createdAt, kind: "chat" as const })),
    ...applications.items.map((item) => ({ at: item.createdAt, kind: "onboarding" as const })),
  ];

  const payoutsMade = users.reduce((total, person) => total + person.madeCents, 0);
  const balanceCents = money.balances.reduce((total, row) => total + row.cents, 0);

  return (
    <DashboardAnalytics
      users={users}
      jobs={jobs}
      selections={selections.items}
      forms={{
        pending: applications.items.filter((item) => item.status === "pending").length,
        approved: applications.items.filter((item) => item.status === "approved").length,
        denied: applications.items.filter((item) => item.status === "denied").length,
      }}
      messages={messages.items.length}
      chats={chats.items.length}
      activity={activity}
      balanceCents={balanceCents}
      payoutsMade={payoutsMade}
      errors={[
        profiles.error,
        selections.error,
        catalog.error,
        applications.error,
        messages.error,
        chats.error,
        money.error,
      ].filter(Boolean)}
    />
  );
}
