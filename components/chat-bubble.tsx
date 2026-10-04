"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { openSupport, sendChat, supportPresence } from "@/app/chat/actions";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";

type Message = {
  id: string;
  from: "team" | "visitor";
  text: string;
};

const threadKey = "titan-support-thread";

export function ChatBubble({
  account,
  online: onlineAtLoad,
}: {
  account: { name: string; email: string } | null;
  online: boolean;
}) {
  const t = ui(useLocale());
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState(onlineAtLoad);
  const [draft, setDraft] = useState("");
  const [name, setName] = useState(account?.name ?? "");
  const [email, setEmail] = useState(account?.email ?? "");
  const [threadId, setThreadId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const inputId = useId();

  useEffect(() => {
    const stored = window.localStorage.getItem(threadKey) ?? "";
    if (stored) setThreadId(stored);
  }, []);

  useEffect(() => {
    function openFromContact() {
      setOpen(true);
    }
    window.addEventListener("titan-open-chat", openFromContact);
    return () => window.removeEventListener("titan-open-chat", openFromContact);
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancel = false;
    supportPresence().then((value) => {
      if (!cancel) setOnline(value);
    });
    return () => {
      cancel = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancel = false;
    openSupport(threadId).then((result) => {
      if (cancel) return;
      if (result.threadId) {
        setThreadId(result.threadId);
        window.localStorage.setItem(threadKey, result.threadId);
      }
      setMessages(
        result.messages.map((item) => ({
          id: item.id,
          from: item.fromStaff ? "team" : "visitor",
          text: item.text,
        })),
      );
    });
    return () => {
      cancel = true;
    };
  }, [open, threadId]);

  async function send(formData: FormData) {
    setError("");
    setPending(true);
    const result = await sendChat(formData);
    setPending(false);
    if (result.error) {
      setError(localizeError(locale, result.error));
      return;
    }

    if (result.threadId) {
      setThreadId(result.threadId);
      window.localStorage.setItem(threadKey, result.threadId);
      const [loaded, presence] = await Promise.all([openSupport(result.threadId), supportPresence()]);
      setOnline(presence);
      setMessages(
        loaded.messages.map((item) => ({
          id: item.id,
          from: item.fromStaff ? "team" : "visitor",
          text: item.text,
        })),
      );
    }
    setDraft("");
  }

  return (
    <div className="chat-anchor fixed right-5 z-40 flex flex-col items-end gap-3">
      {open ? (
        <section
          aria-label={t.chat}
          className="flex w-[min(22rem,calc(100vw-2.5rem))] flex-col border border-white/10 bg-ink text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {t.support}
              </p>
              <p className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide">
                <span
                  className={`size-2.5 shrink-0 rounded-full ${
                    online
                      ? "bg-[#22c55e] shadow-[0_0_8px_#22c55e]"
                      : "bg-[#c4322a] shadow-[0_0_8px_#c4322a]"
                  }`}
                  aria-hidden="true"
                />
                Titan Safety Co.
                <span className="sr-only">{online ? t.adminOnline : t.adminOffline}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-2 py-1 text-sm text-white/70 hover:text-white"
              aria-label={t.closeChat}
            >
              {t.close}
            </button>
          </header>
          <div className="flex max-h-80 flex-col gap-3 overflow-y-auto px-4 py-4">
            {[{ id: "greeting", from: "team" as const, text: t.chatGreeting }, ...messages].map((message) => (
              <p
                key={message.id}
                className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed ${
                  message.from === "visitor"
                    ? "self-end bg-accent text-ink"
                    : "self-start bg-white/10 text-white"
                }`}
              >
                {message.text}
              </p>
            ))}
            {messages.length > 0 && messages.every((item) => item.from === "visitor") && !online ? (
              <p className="max-w-[85%] self-start border border-white/15 px-3 py-2 text-sm leading-relaxed text-white/80" role="status">
                {t.replyWait}
              </p>
            ) : null}
          </div>
          <form
            className="flex flex-col gap-2 border-t border-white/10 p-3"
            action={send}
          >
            {account ? (
              <p className="text-xs text-white/60">{t.sendingAs} {account.name}</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <label className="sr-only" htmlFor={`${inputId}-name`}>
                  {t.name}
                </label>
                <input
                  id={`${inputId}-name`}
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t.name}
                  autoComplete="name"
                  className="min-w-0 border border-white/15 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus-visible:border-accent"
                />
                <label className="sr-only" htmlFor={`${inputId}-email`}>
                  {t.email}
                </label>
                <input
                  id={`${inputId}-email`}
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t.email}
                  autoComplete="email"
                  className="min-w-0 border border-white/15 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus-visible:border-accent"
                />
              </div>
            )}
            {account ? (
              <>
                <input type="hidden" name="name" value={account.name} />
                <input type="hidden" name="email" value={account.email} />
              </>
            ) : null}
            <input type="hidden" name="thread" value={threadId} />
            <div className="flex gap-2">
              <label className="sr-only" htmlFor={inputId}>
                {t.message}
              </label>
              <input
                id={inputId}
                name="message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={t.writeMessage}
                className="min-w-0 flex-1 border border-white/15 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus-visible:border-accent"
              />
              <button
                type="submit"
                disabled={pending}
                className="bg-accent px-3 py-2 font-display text-xs font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400] disabled:opacity-60"
              >
                {t.send}
              </button>
            </div>
            {error ? (
              <p className="text-sm text-accent" role="alert">
                {error}
              </p>
            ) : null}
            {account ? null : (
              <p className="text-xs text-white/55">
                <Link href="/login" className="underline hover:text-accent">
                  {t.chatSignIn}
                </Link>
                {` ${t.chatOr} `}
                <Link href="/signup" className="underline hover:text-accent">
                  {t.chatCreate}
                </Link>
                {` ${t.chatProfile}`}
              </p>
            )}
          </form>
        </section>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? t.closeChat : t.openChat}
        className="flex h-14 w-14 items-center justify-center bg-accent text-ink shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-colors hover:bg-[#e0b400]"
      >
        <ChatIcon />
      </button>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4.2 3.15A.5.5 0 0 1 4 18.8V5a1 1 0 0 1 1-1Z"
      />
    </svg>
  );
}
