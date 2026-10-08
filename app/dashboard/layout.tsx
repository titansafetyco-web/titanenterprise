import { redirect } from "next/navigation";
import { AgentSupportBubble } from "@/components/agent-support";
import { DashboardNav } from "@/components/dashboard-nav";
import { SiteHeader } from "@/components/site-header";
import { loadAgentSupport } from "@/lib/agent-support";
import { loadDashboardAlerts } from "@/lib/alerts";
import { avatarUrl } from "@/lib/avatar";
import { claimSubmissions, getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  await claimSubmissions();
  const [alerts, support] = await Promise.all([
    loadDashboardAlerts(user.id, user.role === "admin"),
    loadAgentSupport(),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="bg-canvas">
        <div className="mx-auto flex min-h-[calc(100svh-6rem)] max-w-6xl flex-col lg:flex-row">
          <DashboardNav
            admin={user.role === "admin"}
            role={user.role}
            alerts={alerts}
            name={user.name}
            photo={avatarUrl(user.avatarPath)}
          />
          <div className="min-w-0 flex-1 overflow-x-clip px-6 py-10 md:py-14">{children}</div>
        </div>
      </main>
      <AgentSupportBubble initial={support} />
    </>
  );
}
