"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";
import {
  markAgentSupportRead,
  openAgentTicket,
  refreshAgentSupport,
  replyAgentTicket,
  setAgentTicketStatus,
} from "@/app/dashboard/support/actions";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";
import type { SupportDesk, SupportThread, TicketStatus } from "@/lib/agent-support";

type TicketFilter = "queue" | "waiting" | "resolved";

export function AgentSupportBubble({ initial }: { initial: SupportDesk }) {
  return <AgentSupport mode="bubble" initial={initial} />;
}

export function AgentSupportCard({ initial }: { initial: SupportDesk }) {
  return <AgentSupport mode="card" initial={initial} />;
}

function visibleThreads(desk: SupportDesk, filter: TicketFilter) {
  if (!desk.admin) return desk.threads;
  if (filter === "waiting") return desk.threads.filter((thread) => thread.status === "waiting");
  if (filter === "resolved") return desk.threads.filter((thread) => thread.status === "resolved");
  return desk.threads.filter((thread) => thread.status === "open" || thread.status === "working");
}

function AgentSupport({ mode, initial }: { mode: "bubble" | "card"; initial: SupportDesk }) {
  const locale = useLocale();
  const t = ui(locale);
  const [open, setOpen] = useState(mode === "card");
  const [desk, setDesk] = useState(initial);
  const [filter, setFilter] = useState<TicketFilter>("queue");
  const [selectedId, setSelectedId] = useState("");
  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState(initial.error);
  const [pending, setPending] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const live = mode === "card" || open;

  useEffect(() => {
    function openFromHelp() {
      setOpen(true);
    }
    window.addEventListener("titan-open-support", openFromHelp);
    return () => window.removeEventListener("titan-open-support", openFromHelp);
  }, []);
  const visible = visibleThreads(desk, filter);
  const selected = desk.threads.find((thread) => thread.id === selectedId) ?? null;

  useEffect(() => {
    let stop = false;
    async function pull() {
      const next = await refreshAgentSupport();
      if (stop) return;
      setDesk(next);
      if (next.error) setError(next.error);
    }
    void pull();
    const timer = window.setInterval(pull, live ? 8000 : 20000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [live]);

  useEffect(() => {
    if (!desk.admin || mode !== "card") return;
    if (visible.some((thread) => thread.id === selectedId)) return;
    setSelectedId(visible[0]?.id ?? "");
  }, [desk.admin, mode, selectedId, visible]);

  useEffect(() => {
    if (!selectedId || !selected || selected.unread === 0) return;
    if (mode === "bubble" && !open) return;
    void markAgentSupportRead(selectedId);
  }, [mode, open, selectedId, selected?.unread]);

  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [selected?.messages.length, open, selectedId]);

  async function refresh() {
    const next = await refreshAgentSupport();
    setDesk(next);
    return next;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    if (!desk.admin && !selected) {
      const result = await openAgentTicket({ subject, body: draft });
      setPending(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSubject("");
      setDraft("");
      setError("");
      setCreating(false);
      const next = await refresh();
      setSelectedId(result.id || next.threads[0]?.id || "");
      return;
    }
    if (!selected) {
      setPending(false);
      return;
    }
    const result = await replyAgentTicket({ threadId: selected.id, body: draft });
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDraft("");
    setError("");
    await refresh();
  }

  async function move(status: TicketStatus) {
    if (!selected || pending) return;
    setPending(true);
    const result = await setAgentTicketStatus(selected.id, status);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError("");
    await refresh();
  }

  const showCreate = !desk.admin && !selected && (creating || desk.threads.length === 0);
  const showList = mode === "card" ? desk.admin : !selected && !showCreate;
  const showDetail = mode === "card" ? visible.length > 0 : Boolean(selected) || showCreate;

  const panel = (
    <SupportPanel
      desk={desk}
      visible={visible}
      selected={selected}
      filter={filter}
      subject={subject}
      draft={draft}
      error={error ? localizeError(locale, error) : ""}
      pending={pending}
      locale={locale}
      scroller={scroller}
      embedded={mode === "card"}
      showList={showList}
      showDetail={showDetail}
      showCreate={showCreate}
      onFilter={(next) => {
        setFilter(next);
        if (mode === "bubble") setSelectedId("");
      }}
      onSelect={(id) => {
        setCreating(false);
        setSelectedId(id);
        setError("");
      }}
      onBack={() => {
        setSelectedId("");
        setCreating(false);
        setError("");
      }}
      onCreate={() => {
        setSelectedId("");
        setCreating(true);
        setError("");
      }}
      onSubject={setSubject}
      onDraft={setDraft}
      onSubmit={submit}
      onMove={move}
    />
  );

  if (mode === "card") return panel;

  const badge = desk.admin ? desk.openCount : desk.unread;

  return (
    <div className="chat-anchor pointer-events-none fixed inset-x-0 z-40 flex justify-center">
      <div className="flex w-full max-w-[var(--site-lock)] justify-end px-6">
        <div className="pointer-events-auto flex max-w-full flex-col items-end gap-3">
          {open ? panel : null}
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-label={open ? t.closeSupportChat : t.openSupportChat}
            className="group relative grid h-14 w-14 place-items-center bg-accent text-ink shadow-[0_8px_18px_rgba(0,0,0,0.28)] hover:bg-[#e0b400]"
          >
            <MessageBoxIcon />
            {badge > 0 ? (
              <span className="absolute -right-1 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-[#c4322a] px-1 text-[10px] font-semibold text-white">
                {badge > 9 ? "9+" : badge}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </div>
  );
}

function SupportPanel({
  desk,
  visible,
  selected,
  filter,
  subject,
  draft,
  error,
  pending,
  locale,
  scroller,
  embedded,
  showList,
  showDetail,
  showCreate,
  onFilter,
  onSelect,
  onBack,
  onCreate,
  onSubject,
  onDraft,
  onSubmit,
  onMove,
}: {
  desk: SupportDesk;
  visible: SupportThread[];
  selected: SupportThread | null;
  filter: TicketFilter;
  subject: string;
  draft: string;
  error: string;
  pending: boolean;
  locale: string;
  scroller: RefObject<HTMLDivElement | null>;
  embedded: boolean;
  showList: boolean;
  showDetail: boolean;
  showCreate: boolean;
  onFilter: (filter: TicketFilter) => void;
  onSelect: (id: string) => void;
  onBack: () => void;
  onCreate: () => void;
  onSubject: (value: string) => void;
  onDraft: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onMove: (status: TicketStatus) => void;
}) {
  const t = ui(useLocale());
  const split = embedded && showList;
  const muted = embedded ? "text-muted" : "text-white/60";
  const field = embedded
    ? "border border-line bg-white text-foreground focus-visible:border-accent"
    : "border border-white/15 bg-transparent text-white placeholder:text-white/40 focus-visible:border-accent";
  const when = (value: string) =>
    new Date(value).toLocaleString(locale === "es" ? "es" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  const counts = {
    queue: desk.threads.filter((thread) => thread.status === "open" || thread.status === "working").length,
    waiting: desk.threads.filter((thread) => thread.status === "waiting").length,
    resolved: desk.threads.filter((thread) => thread.status === "resolved").length,
  };
  const empty =
    filter === "waiting" ? t.ticketEmptyWaiting : filter === "resolved" ? t.ticketEmptyResolved : t.ticketEmptyQueue;

  return (
    <section
      aria-label={t.agentSupport}
      className={
        embedded
          ? "min-w-0 border border-line bg-white"
          : "flex w-[min(24rem,calc(100vw-3rem))] max-w-full flex-col border border-white/10 bg-[#3d4854] text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
      }
    >
      <header className={`px-4 py-3 ${embedded ? "border-b border-line" : "border-b border-white/10"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className={`font-display text-sm font-semibold uppercase tracking-[0.16em] ${embedded ? "" : "text-accent"}`}>
              {t.agentSupport}
            </h2>
            <p className={`mt-1 text-xs ${muted}`}>{t.agentSupportLead}</p>
          </div>
          {!desk.admin && desk.threads.length > 0 && !showCreate ? (
            <button type="button" onClick={onCreate} className="shrink-0 bg-accent px-3 py-2 font-display text-[10px] font-semibold uppercase tracking-wider text-ink">
              {t.ticketNew}
            </button>
          ) : null}
        </div>
        {desk.admin ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {(
              [
                ["queue", t.ticketQueue, counts.queue],
                ["waiting", t.ticketWaiting, counts.waiting],
                ["resolved", t.ticketResolved, counts.resolved],
              ] as const
            ).map(([id, label, count]) => (
              <button
                key={id}
                type="button"
                aria-pressed={filter === id}
                onClick={() => onFilter(id)}
                className={`px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-wider ${
                  filter === id
                    ? "bg-accent text-ink"
                    : embedded
                      ? "border border-line text-foreground hover:bg-canvas"
                      : "border border-white/15 text-white/80 hover:bg-white/5"
                }`}
              >
                {label} {count}
              </button>
            ))}
          </div>
        ) : null}
      </header>
      <div className={split ? "grid min-w-0 lg:grid-cols-[17rem_minmax(0,1fr)]" : ""}>
        {showList ? (
          visible.length === 0 ? (
            <p className={`px-4 py-6 text-sm ${muted}`}>{desk.admin ? empty : t.agentSupportEmpty}</p>
          ) : (
            <ul className={`max-h-96 min-w-0 overflow-y-auto ${embedded ? "divide-y divide-line border-line lg:border-r" : "max-h-80"}`}>
              {visible.map((thread) => (
                <li key={thread.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(thread.id)}
                    className={`flex w-full min-w-0 flex-col px-4 py-3 text-left ${
                      embedded
                        ? thread.id === selected?.id
                          ? "bg-canvas"
                          : "hover:bg-canvas"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-display text-sm font-semibold uppercase tracking-wide">
                        #{thread.number} {thread.subject}
                      </span>
                      {thread.unread > 0 ? (
                        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#c4322a] px-1 text-[10px] font-semibold text-white">
                          {thread.unread}
                        </span>
                      ) : (
                        <StatusPill status={thread.status} embedded={embedded} />
                      )}
                    </span>
                    <span className={`mt-1 truncate text-xs ${muted}`}>
                      {desk.admin ? `${thread.name} · ` : ""}
                      {when(thread.updatedAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : null}
        {showDetail ? (
          <div className="min-w-0">
            {!embedded && (selected || (showCreate && desk.threads.length > 0)) ? (
              <button type="button" onClick={onBack} className={`px-4 pt-3 text-xs ${muted} hover:underline`}>
                {t.agentSupportBack}
              </button>
            ) : null}
            {showCreate ? (
              <form onSubmit={onSubmit} className="flex flex-col gap-3 p-4">
                <p className={`text-sm ${muted}`}>{t.agentSupportStart}</p>
                <label>
                  <span className={`text-xs font-medium ${muted}`}>{t.ticketSubject}</span>
                  <input
                    value={subject}
                    onChange={(event) => onSubject(event.target.value)}
                    required
                    maxLength={80}
                    className={`mt-1.5 w-full px-3 py-2 text-sm outline-none ${field}`}
                  />
                </label>
                <label>
                  <span className="sr-only">{t.writeMessage}</span>
                  <textarea
                    value={draft}
                    onChange={(event) => onDraft(event.target.value)}
                    required
                    rows={4}
                    maxLength={2000}
                    placeholder={t.writeMessage}
                    className={`w-full px-3 py-2 text-sm outline-none ${field}`}
                  />
                </label>
                {error ? <p role="alert" className="text-sm text-[#c4322a]">{error}</p> : null}
                <button type="submit" disabled={pending} className="self-start bg-accent px-4 py-2 font-display text-xs font-semibold uppercase tracking-wider text-ink disabled:opacity-60">
                  {pending ? t.pleaseWait : t.ticketOpenAction}
                </button>
              </form>
            ) : selected ? (
              <>
                <div className={`px-4 py-3 ${embedded ? "border-b border-line" : ""}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-sm font-semibold uppercase tracking-wide">
                      #{selected.number} {selected.subject}
                    </p>
                    <StatusPill status={selected.status} embedded={embedded} />
                  </div>
                  {desk.admin ? (
                    <p className={`mt-1 text-xs ${muted}`}>
                      {selected.name} · {roleLabel(t, selected.role)}
                    </p>
                  ) : null}
                  {desk.admin ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selected.status !== "working" && selected.status !== "resolved" ? (
                        <StatusButton label={t.ticketStart} disabled={pending} onClick={() => onMove("working")} />
                      ) : null}
                      {selected.status !== "waiting" && selected.status !== "resolved" ? (
                        <StatusButton label={t.ticketWait} disabled={pending} onClick={() => onMove("waiting")} />
                      ) : null}
                      {selected.status !== "resolved" ? (
                        <StatusButton label={t.ticketResolve} disabled={pending} onClick={() => onMove("resolved")} />
                      ) : (
                        <StatusButton label={t.ticketReopen} disabled={pending} onClick={() => onMove("open")} />
                      )}
                    </div>
                  ) : selected.status === "resolved" ? (
                    <p className={`mt-2 text-xs ${muted}`}>{t.ticketReopenNote}</p>
                  ) : null}
                </div>
                <div ref={scroller} className={`flex max-h-80 flex-col gap-3 overflow-y-auto px-4 py-4 ${embedded ? "bg-canvas" : ""}`}>
                  {selected.messages.map((note) => (
                    <p
                      key={note.id}
                      className={`max-w-[85%] whitespace-pre-wrap px-3 py-2 text-sm leading-relaxed ${
                        note.mine
                          ? "self-end bg-accent text-ink"
                          : embedded
                            ? "self-start bg-white text-foreground"
                            : "self-start bg-white/10 text-white"
                      }`}
                    >
                      <span className={`mb-1 block text-xs ${note.mine ? "text-ink/70" : muted}`}>
                        {note.mine && !desk.admin
                          ? when(note.at)
                          : `${note.mine || !desk.admin ? t.supportTeam : selected.name} · ${when(note.at)}`}
                      </span>
                      {note.body}
                    </p>
                  ))}
                </div>
                <form onSubmit={onSubmit} className={`flex flex-col gap-2 p-3 ${embedded ? "border-t border-line" : "border-t border-white/10"}`}>
                  <div className="flex gap-2">
                    <label className="sr-only" htmlFor={`ticket-${selected.id}`}>
                      {t.writeMessage}
                    </label>
                    <input
                      id={`ticket-${selected.id}`}
                      value={draft}
                      onChange={(event) => onDraft(event.target.value)}
                      placeholder={t.writeMessage}
                      maxLength={2000}
                      className={`min-w-0 flex-1 px-3 py-2 text-sm outline-none ${field}`}
                    />
                    <button type="submit" disabled={pending} className="bg-accent px-3 py-2 font-display text-xs font-semibold uppercase tracking-wider text-ink disabled:opacity-60">
                      {pending ? t.pleaseWait : t.send}
                    </button>
                  </div>
                  {error ? <p role="alert" className={`text-sm ${embedded ? "text-[#c4322a]" : "text-accent"}`}>{error}</p> : null}
                </form>
              </>
            ) : (
              <p className={`px-4 py-6 text-sm ${muted}`}>{empty}</p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function StatusButton({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="border border-current px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-wider disabled:opacity-60"
    >
      {label}
    </button>
  );
}

function StatusPill({ status, embedded }: { status: TicketStatus; embedded: boolean }) {
  const t = ui(useLocale());
  const label =
    status === "working" ? t.ticketWorking : status === "waiting" ? t.ticketWaiting : status === "resolved" ? t.ticketResolved : t.ticketOpen;
  const tone =
    status === "open"
      ? "bg-accent text-ink"
      : status === "working"
        ? embedded
          ? "bg-ink text-white"
          : "bg-white text-ink"
        : status === "resolved"
          ? embedded
            ? "bg-[#e7f6ec] text-[#137333]"
            : "bg-[#137333] text-white"
          : embedded
            ? "border border-line text-muted"
            : "border border-white/25 text-white/75";
  return <span className={`shrink-0 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-wider ${tone}`}>{label}</span>;
}

function roleLabel(t: ReturnType<typeof ui>, role: string) {
  if (role === "agent") return t.roleAgent;
  if (role === "team") return t.roleTeam;
  if (role === "member") return t.roleMember;
  if (role === "affiliate") return t.roleAffiliate;
  return t.roleAgent;
}

function MessageBoxIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M3 3h18v14H8.5L3 21.5V3Z" />
    </svg>
  );
}
