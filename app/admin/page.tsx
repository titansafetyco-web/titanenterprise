import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ProgramManager } from "@/components/program-manager";
import { campaigns, inquiries, type InquiryStage } from "@/lib/admin";
import { listApplications } from "@/lib/applications";
import { getCurrentUser } from "@/lib/auth";
import { listChats } from "@/lib/chats";
import { listMessages } from "@/lib/messages";
import { listPrograms } from "@/lib/programs";

export const metadata: Metadata = {
  title: "Admin · Titan Safety Co.",
  description: "Inquiries, onboarding, and campaigns for Titan Safety Co.",
};

const stageStyles: Record<InquiryStage, string> = {
  New: "bg-canvas text-foreground",
  Qualified: "bg-accent text-ink",
  Onboarding: "bg-ink text-white",
  Enrolled: "border border-foreground text-foreground",
};

export default async function AdminPage() {
  if (!(await getCurrentUser())) {
    redirect("/login?next=/admin");
  }

  const messages = await listMessages();
  const chats = await listChats();
  const programs = await listPrograms();
  const applications = await listApplications();

  const counts = {
    open: inquiries.filter((item) => item.stage !== "Enrolled").length,
    qualified: inquiries.filter((item) => item.stage === "Qualified").length,
    onboarding: inquiries.filter((item) => item.stage === "Onboarding").length,
    enrolled: inquiries.filter((item) => item.stage === "Enrolled").length,
  };

  const stats = [
    { label: "Open inquiries", value: counts.open },
    { label: "Qualified", value: counts.qualified },
    { label: "Onboarding", value: counts.onboarding },
    { label: "Enrolled", value: counts.enrolled },
  ];

  return (
    <div className="min-h-svh bg-canvas lg:flex">
      <AdminSidebar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
          <section id="overview" className="scroll-mt-6">
            <h1 className="font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">
              Admin
            </h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted">
              Inquiries moving from first interest to a qualified opportunity,
              plus the campaigns that carry each offer.
            </p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <li key={stat.label} className="border-t-4 border-accent bg-white p-6">
                  <p className="font-display text-4xl font-bold">{stat.value}</p>
                  <p className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">
                    {stat.label}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <div id="programs" className="scroll-mt-6">
            <ProgramManager programs={programs} />
          </div>

          <section id="onboarding" className="mt-8 scroll-mt-6 bg-white">
            <div className="border-b border-line px-6 py-5">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
                Affiliate onboarding
              </h2>
            </div>
            {applications.length === 0 ? (
              <p className="px-6 py-8 text-muted">No onboarding forms yet.</p>
            ) : (
              <ul>
                {applications.map((item) => (
                  <li
                    key={item.id}
                    className="border-b border-line px-6 py-5 last:border-0"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-display text-lg font-semibold uppercase tracking-wide">
                        {item.name}
                      </p>
                      <time
                        dateTime={item.createdAt}
                        className="text-sm text-muted"
                      >
                        {new Date(item.createdAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </time>
                    </div>
                    <p className="mt-1 text-sm text-muted">{item.email}</p>
                    <p className="mt-3 font-display text-sm font-semibold uppercase tracking-[0.12em]">
                      {item.program}
                      {item.secondProgram ? ` / ${item.secondProgram}` : ""}
                    </p>
                    {item.note ? (
                      <p className="mt-3 max-w-3xl whitespace-pre-wrap leading-relaxed">
                        {item.note}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="messages" className="mt-12 scroll-mt-6 bg-white">
            <div className="border-b border-line px-6 py-5">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
                Contact messages
              </h2>
            </div>
            {messages.length === 0 ? (
              <p className="px-6 py-8 text-muted">No messages yet.</p>
            ) : (
              <ul>
                {messages.map((item) => (
                  <li
                    key={item.id}
                    className="border-b border-line px-6 py-5 last:border-0"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-display text-lg font-semibold uppercase tracking-wide">
                        {item.name}
                      </p>
                      <time
                        dateTime={item.createdAt}
                        className="text-sm text-muted"
                      >
                        {new Date(item.createdAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </time>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {item.email}
                      <span className="mx-2 text-accent">/</span>
                      {item.interest}
                    </p>
                    <p className="mt-3 max-w-3xl whitespace-pre-wrap leading-relaxed">
                      {item.message}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="chat" className="mt-8 scroll-mt-6 bg-white">
            <div className="border-b border-line px-6 py-5">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
                Chat support
              </h2>
            </div>
            {chats.length === 0 ? (
              <p className="px-6 py-8 text-muted">No chat notes yet.</p>
            ) : (
              <ul>
                {chats.map((item) => (
                  <li
                    key={item.id}
                    className="border-b border-line px-6 py-5 last:border-0"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-display text-lg font-semibold uppercase tracking-wide">
                        {item.name}
                      </p>
                      <time
                        dateTime={item.createdAt}
                        className="text-sm text-muted"
                      >
                        {new Date(item.createdAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </time>
                    </div>
                    <p className="mt-1 text-sm text-muted">{item.email}</p>
                    <p className="mt-3 max-w-3xl whitespace-pre-wrap leading-relaxed">
                      {item.message}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="inquiries" className="mt-8 scroll-mt-6 bg-white">
            <div className="border-b border-line px-6 py-5">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
                Inquiries
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left">
                <thead>
                  <tr className="border-b border-line text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    <th className="px-6 py-3 font-display">Reference</th>
                    <th className="px-6 py-3 font-display">Program</th>
                    <th className="px-6 py-3 font-display">Stage</th>
                    <th className="px-6 py-3 font-display">Next step</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((item) => (
                    <tr key={item.ref} className="border-b border-line last:border-0">
                      <td className="px-6 py-4 font-display font-semibold tracking-wide">
                        {item.ref}
                      </td>
                      <td className="px-6 py-4">{item.program}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-1 font-display text-xs font-semibold uppercase tracking-[0.12em] ${stageStyles[item.stage]}`}
                        >
                          {item.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted">{item.next}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="campaigns" className="mt-8 scroll-mt-6 bg-ink px-6 py-8 text-white md:px-8">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
              Campaigns
              <span className="mt-3 block h-1 w-12 bg-accent" aria-hidden="true" />
            </h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-2">
              {campaigns.map((campaign) => (
                <li key={campaign.name} className="border-t border-white/15 pt-4">
                  <p className="font-display text-lg font-semibold uppercase tracking-wide">
                    {campaign.name}
                  </p>
                  <p className="mt-2 text-sm text-white/70">
                    {campaign.channel}
                    <span className="mx-2 text-accent">/</span>
                    <span className="text-accent">{campaign.status}</span>
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
