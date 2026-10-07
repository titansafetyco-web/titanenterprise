import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MessagesBoard } from "@/components/messages-board";
import { SupportToggle } from "@/components/support-toggle";
import { listApplications } from "@/lib/applications";
import { getCurrentUser } from "@/lib/auth";
import { listChats } from "@/lib/chats";
import { supportIsOnline } from "@/lib/maintenance";
import { contactChoices } from "@/lib/i18n/catalog";
import { localizeError } from "@/lib/i18n/errors";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { listDrafts, listMailbox, syncInbox } from "@/lib/mail";
import { listMessages } from "@/lib/messages";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).messages} · ${site.name}` };
}

function when(locale: string, value: string) {
  return new Date(value).toLocaleString(locale === "es" ? "es" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/messages");
  if (user.role !== "admin") redirect("/dashboard");

  const locale = await getLocale();
  const t = ui(locale);
  const support = user.role === "admin";
  const mailError = support ? await syncInbox() : "";
  const [messages, chats, applications, online, mailbox, drafts] = await Promise.all([
    listMessages(),
    listChats(),
    listApplications(),
    supportIsOnline(),
    support ? listMailbox() : Promise.resolve([]),
    support ? listDrafts() : Promise.resolve([]),
  ]);
  const topic = (value: string) =>
    contactChoices(locale).find((item) => item.value === value)?.label ?? value;
  const statusLabel = (status: string) =>
    status === "approved" ? t.statusApproved : status === "denied" ? t.statusDenied : t.statusPending;

  const threads = new Map<
    string,
    {
      threadId: string;
      name: string;
      email: string;
      at: string;
      messages: { id: string; name: string; body: string; fromStaff: boolean; at: string }[];
    }
  >();
  for (const item of [...chats.items].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))) {
    const current = threads.get(item.threadId) ?? {
      threadId: item.threadId,
      name: item.fromStaff ? "" : item.name,
      email: item.email,
      at: item.createdAt,
      messages: [],
    };
    if (!item.fromStaff && item.name) current.name = item.name;
    current.email = item.email;
    current.at = item.createdAt;
    current.messages.push({
      id: item.id,
      name: item.name,
      body: item.message,
      fromStaff: item.fromStaff,
      at: item.createdAt,
    });
    threads.set(item.threadId, current);
  }

  const error = [messages.error, chats.error, applications.error].filter(Boolean)[0] ?? "";
  const emails = [
    ...mailbox.map((item) => ({
      id: `mail-${item.id}`,
      name: item.name,
      email: item.email,
      topic: item.subject || "—",
      body: item.body,
      at: item.createdAt,
      replyId: item.id,
      replyKind: "mailbox" as const,
      direction: item.direction,
    })),
    ...messages.items.map((item) => ({
      id: `form-${item.id}`,
      name: item.name,
      email: item.email,
      topic: topic(item.interest),
      body: item.message,
      at: item.createdAt,
      replyId: item.id,
      replyKind: "contact" as const,
      direction: "in" as const,
    })),
  ].sort((a, b) => +new Date(b.at) - +new Date(a.at));

  return (
    <section className="bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">{t.messages}</h1>
        <SupportToggle online={online} />
      </div>
      <MessagesBoard
        error={error ? localizeError(locale, error) : ""}
        mailNote={mailError ? localizeError(locale, mailError) : ""}
        canReply={support}
        emails={emails.map((item) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          topic: item.topic,
          body: item.body,
          when: when(locale, item.at),
          replyId: item.replyId,
          replyKind: item.replyKind,
          direction: item.direction,
        }))}
        drafts={drafts.map((item) => ({
          id: item.id,
          email: item.email,
          topic: item.subject || "—",
          body: item.body,
          when: when(locale, item.updatedAt),
        }))}
        forms={applications.items.map((item) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          program: item.program,
          status: statusLabel(item.status),
          when: when(locale, item.createdAt),
        }))}
        tickets={[...threads.values()]
          .sort((a, b) => +new Date(b.at) - +new Date(a.at))
          .map((ticket) => ({
            threadId: ticket.threadId,
            name: ticket.name || ticket.email,
            email: ticket.email,
            when: when(locale, ticket.at),
            messages: ticket.messages.map((item) => ({
              id: item.id,
              name: item.name,
              body: item.body,
              fromStaff: item.fromStaff,
              when: when(locale, item.at),
            })),
          }))}
      />
    </section>
  );
}
