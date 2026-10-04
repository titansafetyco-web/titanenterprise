"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { sendChat } from "@/app/chat/actions";

type Message = {
  id: number;
  from: "team" | "visitor";
  text: string;
};

const greeting: Message = {
  id: 0,
  from: "team",
  text: "Ask about safety products, energy, media, software, insurance affiliates, or other affiliate programs. A note here goes to the team.",
};

export function ChatBubble({
  account,
}: {
  account: { name: string; email: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [name, setName] = useState(account?.name ?? "");
  const [email, setEmail] = useState(account?.email ?? "");
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const inputId = useId();

  async function send(formData: FormData) {
    setError("");
    setPending(true);
    const result = await sendChat(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }

    const text = String(formData.get("message") ?? "").trim();
    setMessages((current) => [
      ...current,
      { id: current.length, from: "visitor", text },
      {
        id: current.length + 1,
        from: "team",
        text: "Thanks. That note is with the team.",
      },
    ]);
    setDraft("");
  }

  return (
    <div className="chat-anchor fixed right-5 z-40 flex flex-col items-end gap-3">
      {open ? (
        <section
          aria-label="Chat"
          className="flex w-[min(22rem,calc(100vw-2.5rem))] flex-col border border-white/10 bg-ink text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Support
              </p>
              <p className="font-display text-sm font-semibold uppercase tracking-wide">
                Titan Safety Co.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-2 py-1 text-sm text-white/70 hover:text-white"
              aria-label="Close chat"
            >
              Close
            </button>
          </header>
          <div className="flex max-h-80 flex-col gap-3 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
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
          </div>
          <form
            className="flex flex-col gap-2 border-t border-white/10 p-3"
            action={send}
          >
            {account ? (
              <p className="text-xs text-white/60">Sending as {account.name}</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <label className="sr-only" htmlFor={`${inputId}-name`}>
                  Name
                </label>
                <input
                  id={`${inputId}-name`}
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Name"
                  autoComplete="name"
                  className="min-w-0 border border-white/15 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus-visible:border-accent"
                />
                <label className="sr-only" htmlFor={`${inputId}-email`}>
                  Email
                </label>
                <input
                  id={`${inputId}-email`}
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email"
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
            <div className="flex gap-2">
              <label className="sr-only" htmlFor={inputId}>
                Message
              </label>
              <input
                id={inputId}
                name="message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write a message"
                className="min-w-0 flex-1 border border-white/15 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus-visible:border-accent"
              />
              <button
                type="submit"
                disabled={pending}
                className="bg-accent px-3 py-2 font-display text-xs font-semibold uppercase tracking-wider text-ink hover:bg-[#e0b400] disabled:opacity-60"
              >
                Send
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
                  Sign in
                </Link>
                {" or "}
                <Link href="/signup" className="underline hover:text-accent">
                  create an account
                </Link>
                {" to send with your profile."}
              </p>
            )}
          </form>
        </section>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Open chat"}
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
