"use client";

import { useActionState, useEffect, useId, useRef, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  clearSupportBox,
  deleteEmail,
  forwardEmail,
  refreshMailbox,
  replyByEmail,
  replyToTicket,
  saveDraft,
  sendComposedEmail,
  type ReplyState,
} from "@/app/dashboard/messages/actions";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";

type EmailItem = {
  id: string;
  name: string;
  email: string;
  topic: string;
  body: string;
  when: string;
  replyId: string;
  replyKind: "mailbox" | "contact";
  direction: "in" | "out";
};

type DraftItem = {
  id: string;
  email: string;
  topic: string;
  body: string;
  when: string;
};

type MailFolder = "inbox" | "sent" | "drafts";

type FormItem = {
  id: string;
  name: string;
  email: string;
  program: string;
  status: string;
  when: string;
};

type TicketMessage = {
  id: string;
  name: string;
  body: string;
  fromStaff: boolean;
  when: string;
};

type Ticket = {
  threadId: string;
  name: string;
  email: string;
  when: string;
  messages: TicketMessage[];
};

const initialReply: ReplyState = { error: "" };
const pageSize = 5;

function usePaged<T>(items: T[]) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pages - 1);
  return {
    current,
    pages,
    visible: items.slice(current * pageSize, current * pageSize + pageSize),
    setPage,
  };
}

export function MessagesBoard({
  emails,
  drafts,
  forms,
  tickets,
  canReply,
  error,
  mailNote,
}: {
  emails: EmailItem[];
  drafts: DraftItem[];
  forms: FormItem[];
  tickets: Ticket[];
  canReply: boolean;
  error: string;
  mailNote: string;
}) {
  const locale = useLocale();
  const t = ui(locale);
  const router = useRouter();
  const [emailId, setEmailId] = useState("");
  const [folder, setFolder] = useState<MailFolder>("inbox");
  const [compose, setCompose] = useState<DraftItem | null>(null);
  const [openId, setOpenId] = useState(tickets[0]?.threadId ?? "");
  const [reply, sendReply, pending] = useActionState(replyToTicket, initialReply);
  const wasPending = useRef(false);
  const open = tickets.find((ticket) => ticket.threadId === openId) ?? tickets[0];
  const openEmail = emails.find((item) => item.id === emailId) ?? null;
  const folderEmails =
    folder === "sent" ? emails.filter((item) => item.direction === "out") : emails.filter((item) => item.direction !== "out");
  const emailPage = usePaged(folder === "drafts" ? [] : folderEmails);
  const draftPage = usePaged(drafts);
  const formPage = usePaged(forms);
  const [refreshNote, setRefreshNote] = useState("");

  useEffect(() => {
    if (wasPending.current && !pending && !reply.error) router.refresh();
    wasPending.current = pending;
  }, [pending, reply.error, router]);

  return (
    <>
      {error ? <p className="px-6 py-4 text-sm text-muted">{error}</p> : null}
      <div className="grid gap-4 px-6 py-6 lg:grid-cols-3">
        <Summary label={t.emails} count={emails.length} tone="#f5c400" />
        <Summary label={t.submissionForms} count={forms.length} tone="#101820" />
        <Summary label={t.supportTickets} count={tickets.length} tone="#c4322a" />
      </div>
      <div className="grid gap-4 px-6 pb-6">
        <Card
          title={t.emails}
          action={
            canReply ? (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <FolderButton
                  active={folder === "inbox"}
                  onClick={() => {
                    setFolder("inbox");
                    emailPage.setPage(0);
                  }}
                >
                  {t.inbox}
                </FolderButton>
                <FolderButton
                  active={folder === "sent"}
                  onClick={() => {
                    setFolder("sent");
                    emailPage.setPage(0);
                  }}
                >
                  {t.sent}
                </FolderButton>
                <FolderButton
                  active={folder === "drafts"}
                  onClick={() => {
                    setFolder("drafts");
                    draftPage.setPage(0);
                  }}
                >
                  {t.drafts}
                </FolderButton>
                <button
                  type="button"
                  onClick={() => setCompose({ id: "", email: "", topic: "", body: "", when: "" })}
                  className="bg-accent px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400]"
                >
                  {t.compose}
                </button>
                <RefreshMailbox onNote={setRefreshNote} />
                <ClearMessages box="emails" />
              </div>
            ) : null
          }
        >
          {refreshNote || mailNote ? <p className="mb-4 text-sm text-muted">{refreshNote || mailNote}</p> : null}
          {folder === "drafts" ? (
            drafts.length === 0 ? (
              <p className="text-sm text-muted">{t.noDrafts}</p>
            ) : (
              <ul className={`-mx-5 ${mailNote ? "mt-4 border-t border-line" : "-mt-5"} ${draftPage.pages > 1 ? "" : "-mb-5"}`}>
                {draftPage.visible.map((item, index) => (
                  <MailRow
                    key={item.id}
                    index={index}
                    name={item.email || t.drafts}
                    topic={item.topic}
                    when={item.when}
                    onOpen={() => setCompose(item)}
                    remove={
                      canReply ? (
                        <DeleteMail
                          kind="draft"
                          id={item.id}
                          onDone={() => {
                            if (compose?.id === item.id) setCompose(null);
                          }}
                        />
                      ) : null
                    }
                  />
                ))}
              </ul>
            )
          ) : folderEmails.length === 0 ? (
            <p className="text-sm text-muted">{folder === "sent" ? t.noSent : t.noEmails}</p>
          ) : (
            <ul className={`-mx-5 ${mailNote ? "mt-4 border-t border-line" : "-mt-5"} ${emailPage.pages > 1 ? "" : "-mb-5"}`}>
              {emailPage.visible.map((item, index) => (
                <MailRow
                  key={item.id}
                  index={index}
                  name={item.name}
                  topic={item.topic}
                  when={item.when}
                  onOpen={() => setEmailId(item.id)}
                  remove={
                    canReply ? (
                      <DeleteMail
                        kind={item.replyKind}
                        id={item.replyId}
                        onDone={() => {
                          if (emailId === item.id) setEmailId("");
                        }}
                      />
                    ) : null
                  }
                />
              ))}
            </ul>
          )}
          <Pager
            page={folder === "drafts" ? draftPage.current : emailPage.current}
            pages={folder === "drafts" ? draftPage.pages : emailPage.pages}
            onPage={folder === "drafts" ? draftPage.setPage : emailPage.setPage}
          />
          {openEmail ? (
            <EmailOverlay item={openEmail} canReply={canReply} onClose={() => setEmailId("")} />
          ) : null}
          {compose ? (
            <ComposeOverlay
              item={compose}
              onClose={() => setCompose(null)}
              onSaved={() => {
                setCompose(null);
                setFolder("drafts");
              }}
              onSent={() => {
                setCompose(null);
                setFolder("sent");
              }}
            />
          ) : null}
        </Card>
        <Card title={t.submissionForms} action={canReply ? <ClearMessages box="forms" /> : null}>
          {forms.length === 0 ? (
            <p className="text-sm text-muted">{t.noForms}</p>
          ) : (
            <ul className="divide-y divide-line">
              {formPage.visible.map((item) => (
                <li key={item.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-display text-sm font-semibold uppercase tracking-wide">{item.name}</p>
                    <time className="text-xs text-muted">{item.when}</time>
                  </div>
                  <p className="mt-1 text-sm text-[#8a6a12]">{item.email}</p>
                  <p className="mt-2 text-sm">{item.program}</p>
                  <p className="mt-2 font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    {item.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Pager page={formPage.current} pages={formPage.pages} onPage={formPage.setPage} />
        </Card>
      </div>
      <div className="px-6 pb-8">
        <Card title={t.supportTickets} action={canReply ? <ClearMessages box="chats" /> : null}>
          {tickets.length === 0 ? (
            <p className="text-sm text-muted">{t.noTickets}</p>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[16rem_1fr]">
              <ul className="divide-y divide-line border border-line">
                {tickets.map((ticket) => {
                  const active = ticket.threadId === open?.threadId;
                  return (
                    <li key={ticket.threadId}>
                      <button
                        type="button"
                        onClick={() => setOpenId(ticket.threadId)}
                        className={`w-full px-4 py-3 text-left ${active ? "bg-canvas" : "hover:bg-canvas"}`}
                      >
                        <p className="font-display text-sm font-semibold uppercase tracking-wide">{ticket.name}</p>
                        <p className="mt-1 truncate text-xs text-muted">{ticket.email}</p>
                        <p className="mt-1 text-xs text-muted">{ticket.when}</p>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {open ? (
                <div>
                  <div className="flex max-h-96 flex-col gap-3 overflow-y-auto bg-canvas p-4">
                    {open.messages.map((item) => (
                      <div key={item.id} className={item.fromStaff ? "self-end" : "self-start"}>
                        <p className="mb-1 text-xs text-muted">
                          {item.fromStaff ? t.teamReply : item.name} · {item.when}
                        </p>
                        <p
                          className={`max-w-md whitespace-pre-wrap px-3 py-2 text-sm leading-relaxed ${
                            item.fromStaff ? "bg-accent text-ink" : "bg-white text-foreground"
                          }`}
                        >
                          {item.body}
                        </p>
                      </div>
                    ))}
                  </div>
                  {canReply ? (
                    <form key={open.messages.length} action={sendReply} className="mt-4">
                      <input type="hidden" name="thread" value={open.threadId} />
                      <label className="block">
                        <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                          {t.reply}
                        </span>
                        <textarea
                          name="message"
                          required
                          rows={3}
                          minLength={2}
                          maxLength={2000}
                          className="mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent"
                        />
                      </label>
                      {reply.error ? (
                        <p role="alert" className="mt-3 border-l-4 border-accent pl-3 text-sm">
                          {localizeError(locale, reply.error)}
                        </p>
                      ) : null}
                      <button
                        type="submit"
                        disabled={pending}
                        className="mt-3 bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400] disabled:opacity-60"
                      >
                        {pending ? t.pleaseWait : t.sendReply}
                      </button>
                    </form>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function FolderButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wider ${
        active ? "bg-ink text-white" : "border border-line text-foreground hover:bg-canvas"
      }`}
    >
      {children}
    </button>
  );
}

function MailRow({
  index,
  name,
  topic,
  when,
  onOpen,
  remove,
}: {
  index: number;
  name: string;
  topic: string;
  when: string;
  onOpen: () => void;
  remove: ReactNode;
}) {
  return (
    <li className={`flex items-stretch ${index % 2 === 0 ? "bg-canvas" : "bg-white"}`}>
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 px-5 py-3 text-left hover:bg-[#f3f0e4]"
      >
        <span className="shrink-0 font-display text-sm font-semibold uppercase tracking-wide">{name}</span>
        <span className="min-w-0 flex-1 truncate text-sm text-muted">{topic}</span>
        <time className="shrink-0 text-xs text-muted">{when}</time>
      </button>
      {remove ? <div className="flex items-center pr-3">{remove}</div> : null}
    </li>
  );
}

function DeleteMail({
  kind,
  id,
  onDone,
}: {
  kind: "mailbox" | "contact" | "draft";
  id: string;
  onDone: () => void;
}) {
  const locale = useLocale();
  const t = ui(locale);
  const router = useRouter();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending]);

  function confirm() {
    setError("");
    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("id", id);
    start(async () => {
      const result = await deleteEmail(formData);
      if (result) {
        setError(localizeError(locale, result));
        return;
      }
      setOpen(false);
      onDone();
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label={t.deleteEmail}
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="inline-flex h-[30px] w-[30px] items-center justify-center text-[#c4322a] hover:bg-[#fde8e6]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4 7h16" />
          <path d="M9 7V5h6v2" />
          <path d="M8 7l1 12h6l1-12" />
        </svg>
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget && !pending) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md border border-line bg-white p-6 shadow-[0_24px_60px_rgba(16,24,32,0.2)]"
          >
            <h2 id={titleId} className="font-display text-2xl font-bold uppercase tracking-wide">
              {t.deleteEmail}
            </h2>
            <p className="mt-4 leading-relaxed">{t.deleteEmailWarning}</p>
            {error ? (
              <p role="alert" className="mt-4 border-l-4 border-accent pl-3 text-sm">
                {error}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="border border-ink px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-canvas disabled:opacity-60"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={confirm}
                className="bg-[#c4322a] px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a82822] disabled:opacity-60"
              >
                {pending ? t.pleaseWait : t.deleteEmail}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ComposeOverlay({
  item,
  onClose,
  onSaved,
  onSent,
}: {
  item: DraftItem;
  onClose: () => void;
  onSaved: () => void;
  onSent: () => void;
}) {
  const locale = useLocale();
  const t = ui(locale);
  const router = useRouter();
  const titleId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, pending]);

  function run(action: "send" | "save") {
    const form = formRef.current;
    if (!form) return;
    if (action === "send" && !form.reportValidity()) return;
    setError("");
    const formData = new FormData(form);
    start(async () => {
      const result = action === "send" ? await sendComposedEmail(formData) : await saveDraft(formData);
      if (result) {
        setError(localizeError(locale, result));
        return;
      }
      if (action === "send") onSent();
      else onSaved();
      router.refresh();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[min(40rem,calc(100vh-3rem))] w-full max-w-2xl flex-col border border-line bg-white shadow-[0_24px_60px_rgba(16,24,32,0.2)]"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
          <h2 id={titleId} className="font-display text-xl font-bold uppercase tracking-wide">
            {t.compose}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="font-display text-xs font-semibold uppercase tracking-wider text-muted hover:text-foreground"
          >
            {t.close}
          </button>
        </div>
        <form ref={formRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5" onSubmit={(event) => event.preventDefault()}>
          {item.id ? <input type="hidden" name="draft" value={item.id} /> : null}
          <label className="block">
            <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t.forwardTo}</span>
            <input
              name="to"
              type="email"
              required
              defaultValue={item.email}
              autoFocus
              className="mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent"
            />
          </label>
          <label className="mt-4 block">
            <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t.subject}</span>
            <input
              name="subject"
              defaultValue={item.topic === "—" ? "" : item.topic}
              maxLength={300}
              className="mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent"
            />
          </label>
          <label className="mt-4 block">
            <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t.message}</span>
            <textarea
              name="message"
              required
              rows={6}
              minLength={2}
              maxLength={8000}
              defaultValue={item.body}
              className="mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent"
            />
          </label>
          {error ? (
            <p role="alert" className="mt-3 border-l-4 border-accent pl-3 text-sm">
              {error}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={onClose}
              className="border border-ink px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-canvas disabled:opacity-60"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => run("save")}
              className="border border-ink px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-canvas disabled:opacity-60"
            >
              {pending ? t.pleaseWait : t.saveDraft}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => run("send")}
              className="bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400] disabled:opacity-60"
            >
              {pending ? t.pleaseWait : t.send}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RefreshMailbox({ onNote }: { onNote: (note: string) => void }) {
  const locale = useLocale();
  const t = ui(locale);
  const router = useRouter();
  const [pending, start] = useTransition();

  function refresh() {
    onNote("");
    start(async () => {
      const result = await refreshMailbox();
      if (result) {
        onNote(localizeError(locale, result));
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={refresh}
      disabled={pending}
      aria-label={pending ? t.pleaseWait : t.refresh}
      className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center border border-ink text-ink hover:bg-canvas disabled:opacity-60"
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-4 w-4 ${pending ? "animate-spin" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12a9 9 0 1 1-2.6-6.3" />
        <path d="M21 3v6h-6" />
      </svg>
    </button>
  );
}

function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) {
  const locale = useLocale();
  const t = ui(locale);
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page === 0}
        className="border border-line px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-canvas disabled:text-muted"
      >
        {t.activityPrevious}
      </button>
      <p className="min-w-12 text-center font-display text-xs font-semibold uppercase tracking-wider text-muted">
        {page + 1} / {pages}
      </p>
      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page >= pages - 1}
        className="border border-line px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-canvas disabled:text-muted"
      >
        {t.activityNext}
      </button>
    </div>
  );
}

function Summary({ label, count, tone }: { label: string; count: number; tone: string }) {
  return (
    <article className="border border-line bg-white px-5 py-4" style={{ borderTop: `4px solid ${tone}` }}>
      <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{count}</p>
    </article>
  );
}

function EmailOverlay({
  item,
  canReply,
  onClose,
}: {
  item: EmailItem;
  canReply: boolean;
  onClose: () => void;
}) {
  const locale = useLocale();
  const t = ui(locale);
  const router = useRouter();
  const titleId = useId();
  const [mode, setMode] = useState<"read" | "reply" | "forward">("read");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const canSend = canReply && Boolean(item.replyId);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, pending]);

  function send(formData: FormData) {
    setError("");
    start(async () => {
      const result = mode === "forward" ? await forwardEmail(formData) : await replyByEmail(formData);
      if (result) {
        setError(localizeError(locale, result));
        return;
      }
      setMode("read");
      router.refresh();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[min(40rem,calc(100vh-3rem))] w-full max-w-2xl flex-col border border-line bg-white shadow-[0_24px_60px_rgba(16,24,32,0.2)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-xl font-bold uppercase tracking-wide">
              {item.topic}
            </h2>
            <p className="mt-2 text-sm">
              <span className="font-semibold">{item.name}</span>
              <span className="text-muted"> · {item.email}</span>
            </p>
            <p className="mt-1 text-xs text-muted">{item.when}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 font-display text-xs font-semibold uppercase tracking-wider text-muted hover:text-foreground"
          >
            {t.close}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.body}</p>
        </div>
        {canSend && mode !== "read" ? (
          <form action={send} className="border-t border-line px-6 py-5">
            <input type="hidden" name="kind" value={item.replyKind} />
            <input type="hidden" name="id" value={item.replyId} />
            {mode === "forward" ? (
              <label className="block">
                <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  {t.forwardTo}
                </span>
                <input
                  name="to"
                  type="email"
                  required
                  autoFocus
                  className="mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent"
                />
              </label>
            ) : null}
            <label className="mt-4 block">
              <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {mode === "forward" ? t.forward : t.reply}
              </span>
              <textarea
                name="message"
                required={mode === "reply"}
                rows={4}
                minLength={mode === "reply" ? 2 : undefined}
                maxLength={2000}
                autoFocus={mode === "reply"}
                className="mt-2 w-full border border-line bg-white px-3 py-3 text-foreground outline-none focus-visible:border-accent"
              />
            </label>
            {error ? (
              <p role="alert" className="mt-3 border-l-4 border-accent pl-3 text-sm">
                {error}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setError("");
                  setMode("read");
                }}
                className="border border-ink px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-canvas disabled:opacity-60"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={pending}
                className="bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400] disabled:opacity-60"
              >
                {pending ? t.pleaseWait : mode === "forward" ? t.sendForward : t.sendReply}
              </button>
            </div>
          </form>
        ) : canSend ? (
          <div className="flex flex-wrap gap-3 border-t border-line px-6 py-5">
            <button
              type="button"
              onClick={() => {
                setError("");
                setMode("reply");
              }}
              className="bg-accent px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400]"
            >
              {t.reply}
            </button>
            <button
              type="button"
              onClick={() => {
                setError("");
                setMode("forward");
              }}
              className="border border-ink px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-canvas"
            >
              {t.forward}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="border border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em]">{title}</h2>
        {action}
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

function ClearMessages({ box }: { box: "emails" | "forms" | "chats" }) {
  const locale = useLocale();
  const t = ui(locale);
  const router = useRouter();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending]);

  function confirm() {
    setError("");
    const formData = new FormData();
    formData.set("box", box);
    start(async () => {
      const result = await clearSupportBox(formData);
      if (result) {
        setError(localizeError(locale, result));
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="shrink-0 border border-[#c4322a] px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wider text-[#c4322a] hover:bg-[#c4322a] hover:text-white"
      >
        {t.clearMessages}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget && !pending) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md border border-line bg-white p-6 shadow-[0_24px_60px_rgba(16,24,32,0.2)]"
          >
            <h2 id={titleId} className="font-display text-2xl font-bold uppercase tracking-wide">
              {t.clearMessages}
            </h2>
            <p className="mt-4 leading-relaxed">{t.clearMessagesWarning}</p>
            {error ? (
              <p role="alert" className="mt-4 border-l-4 border-accent pl-3 text-sm">
                {error}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="border border-ink px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink hover:bg-canvas disabled:opacity-60"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                data-clear-confirm="true"
                disabled={pending}
                onClick={confirm}
                className="bg-[#c4322a] px-5 py-3 font-display text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a82822] disabled:opacity-60"
              >
                {pending ? t.pleaseWait : t.clearMessages}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
