"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { verifyJobAction } from "@/app/dashboard/team/actions";
import { useLocale } from "@/components/locale-provider";
import { localizeError } from "@/lib/i18n/errors";
import { ui } from "@/lib/i18n/ui";
import type { JobPay, JobProgress } from "@/lib/jobs";
import { formatMoney } from "@/lib/money";

export type JobReviewItem = {
  userId: string;
  jobId: string;
  name: string;
  title: string;
  pay: JobPay;
  payCents: number;
  status: JobProgress;
  seconds: number;
};

type Tab = "queue" | "performance" | "members" | "jobs";

const tones: Record<JobProgress, string> = {
  processing: "#6e5c43",
  review: "#e0b000",
  done: "#0f766e",
  incomplete: "#9f1239",
};

function formatClock(total: number) {
  const seconds = Math.max(0, Math.floor(total));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return [hours, minutes, rest].map((part) => String(part).padStart(2, "0")).join(":");
}

function counts(items: readonly JobReviewItem[]) {
  return {
    processing: items.filter((item) => item.status === "processing").length,
    review: items.filter((item) => item.status === "review").length,
    done: items.filter((item) => item.status === "done").length,
    incomplete: items.filter((item) => item.status === "incomplete").length,
    seconds: items.reduce((total, item) => total + item.seconds, 0),
  };
}

function completion(done: number, incomplete: number) {
  const decided = done + incomplete;
  if (decided === 0) return 0;
  return Math.round((done / decided) * 100);
}

function Donut({
  parts,
  percent,
  label,
}: {
  parts: { key: string; value: number; color: string }[];
  percent: number;
  label: string;
}) {
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0" role="img" aria-label={`${percent}% ${label}`}>
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#e7dcc4" strokeWidth="12" />
      {total > 0
        ? parts.map((part) => {
            const length = (part.value / total) * circumference;
            const dash = `${length} ${circumference - length}`;
            const sliceOffset = offset;
            offset += length;
            if (part.value === 0) return null;
            return (
              <circle
                key={part.key}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={part.color}
                strokeWidth="12"
                strokeDasharray={dash}
                strokeDashoffset={-sliceOffset}
                transform="rotate(-90 60 60)"
              />
            );
          })
        : null}
      <text x="60" y="64" textAnchor="middle" className="fill-[#1c160c] font-display text-[18px] font-bold">
        {percent}%
      </text>
    </svg>
  );
}

function Stack({
  parts,
}: {
  parts: { key: string; value: number; color: string }[];
}) {
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  return (
    <div className="flex h-3 overflow-hidden bg-[#f5efe2]">
      {total === 0
        ? null
        : parts.map((part) =>
            part.value > 0 ? (
              <div key={part.key} style={{ width: `${(part.value / total) * 100}%`, background: part.color }} />
            ) : null,
          )}
    </div>
  );
}

export function JobReviews({ items, error }: { items: readonly JobReviewItem[]; error: string }) {
  const locale = useLocale();
  const t = ui(locale);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("queue");
  const [rows, setRows] = useState(items);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setRows(items);
  }, [items]);
  const [pending, start] = useTransition();

  const tally = useMemo(() => counts(rows), [rows]);
  const rate = completion(tally.done, tally.incomplete);
  const statusName = (status: JobProgress) =>
    status === "done" ? t.jobDone : status === "incomplete" ? t.jobIncomplete : status === "review" ? t.jobReview : t.jobProcessing;
  const payName = (pay: JobPay) => (pay === "biweekly" ? t.payBiweekly : t.payWeekly);

  const slices = (source: ReturnType<typeof counts>) => [
    { key: "processing", value: source.processing, color: tones.processing },
    { key: "review", value: source.review, color: tones.review },
    { key: "done", value: source.done, color: tones.done },
    { key: "incomplete", value: source.incomplete, color: tones.incomplete },
  ];

  const groups = (key: "name" | "title") => {
    const map = new Map<string, JobReviewItem[]>();
    for (const row of rows) {
      const id = key === "name" ? row.userId : row.jobId;
      const list = map.get(id) ?? [];
      list.push(row);
      map.set(id, list);
    }
    return [...map.entries()]
      .map(([id, list]) => ({ id, label: list[0]?.[key] ?? "", ...counts(list) }))
      .sort((a, b) => b.done - a.done || b.review - a.review || a.label.localeCompare(b.label));
  };

  function decide(row: JobReviewItem, status: "done" | "incomplete") {
    setNotice("");
    start(async () => {
      const data = new FormData();
      data.set("userId", row.userId);
      data.set("jobId", row.jobId);
      data.set("status", status);
      const result = await verifyJobAction(data);
      if (result.error) {
        setNotice(localizeError(locale, result.error));
        return;
      }
      setRows((current) =>
        current.map((item) =>
          item.userId === row.userId && item.jobId === row.jobId ? { ...item, status } : item,
        ),
      );
      router.refresh();
    });
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "queue", label: t.jobReviewQueue, count: tally.review },
    { id: "performance", label: t.performance },
    { id: "members", label: t.members },
    { id: "jobs", label: t.jobReviewJobs },
  ];
  const waiting = rows.filter((row) => row.status === "review");

  return (
    <section className="bg-white">
      <div className="border-b border-line px-6 py-5">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">{t.jobReviews}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">{t.jobReviewsLead}</p>
      </div>
      {error ? <p className="border-b border-line px-6 py-4 text-sm text-muted">{localizeError(locale, error)}</p> : null}
      <div className="flex gap-1 overflow-x-auto border-b border-line px-4 py-3" role="tablist">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`review-tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`review-panel-${item.id}`}
            onClick={() => setTab(item.id)}
            className={`inline-flex shrink-0 items-center gap-2 px-3 py-2 font-display text-[12px] font-semibold uppercase tracking-[0.12em] ${
              tab === item.id ? "bg-[#fff4d2] text-[#1c160c]" : "text-[#6e5c43] hover:bg-[#f3e6c8]"
            }`}
          >
            {item.label}
            {item.count ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center bg-[#e0b000] px-1 text-[10px] text-[#1c160c]">
                {item.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "queue" ? (
        <div role="tabpanel" id="review-panel-queue" aria-labelledby="review-tab-queue" className="px-6 py-5">
          <p className="max-w-2xl text-sm text-muted">{t.jobPenaltyNote}</p>
          {notice ? (
            <p role="alert" className="mt-4 border-l-4 border-accent pl-3 text-sm">
              {notice}
            </p>
          ) : null}
          {waiting.length === 0 ? (
            <p className="mt-6 text-sm text-muted">{t.jobReviewEmpty}</p>
          ) : (
            <ul className="mt-5 grid gap-3">
              {waiting.map((row) => (
                <li key={`${row.userId}-${row.jobId}`} className="border border-[#d9c79a] bg-[#fffdf8] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-lg font-semibold uppercase tracking-wide">{row.title}</p>
                      <p className="mt-1 text-sm text-muted">
                        {row.name} · {payName(row.pay)}
                        {row.payCents > 0 ? ` · ${formatMoney(row.payCents, locale)}` : ""}
                        {" · "}
                        {formatClock(row.seconds)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => decide(row, "done")}
                        className="inline-flex h-9 items-center border border-[#0f766e] bg-[#dcfce7] px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0f766e] hover:bg-[#bbf7d0] disabled:opacity-60"
                      >
                        {t.jobReviewApprove}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => decide(row, "incomplete")}
                        className="inline-flex h-9 items-center border border-[#9f1239] bg-[#ffe4e6] px-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9f1239] hover:bg-[#fecdd3] disabled:opacity-60"
                      >
                        {t.jobReviewDeny}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {tab === "performance" ? (
        <div role="tabpanel" id="review-panel-performance" aria-labelledby="review-tab-performance" className="px-6 py-5">
          <div className="flex flex-wrap items-center gap-6">
            <Donut parts={slices(tally)} percent={rate} label={t.jobReviewCompletion} />
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t.jobReviewCompletion}</p>
              <p className="mt-1 font-display text-4xl font-bold">{rate}%</p>
              <p className="mt-1 text-sm text-muted">
                {tally.done} / {tally.done + tally.incomplete} {t.jobReviewDecided}
              </p>
              <p className="mt-2 text-sm text-muted">
                {t.jobReviewTime}: {formatClock(tally.seconds)}
              </p>
            </div>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {slices(tally).map((part) => (
              <li key={part.key} className="border-t-4 bg-canvas p-4" style={{ borderColor: part.color }}>
                <p className="font-display text-3xl font-bold">{part.value}</p>
                <p className="mt-1 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  {statusName(part.key as JobProgress)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {tab === "members" || tab === "jobs" ? (
        <div
          role="tabpanel"
          id={`review-panel-${tab}`}
          aria-labelledby={`review-tab-${tab}`}
          className="px-6 py-5"
        >
          {rows.length === 0 ? (
            <p className="text-sm text-muted">{t.jobReviewEmpty}</p>
          ) : (
            <ul className="grid gap-4">
              {groups(tab === "members" ? "name" : "title").map((group) => {
                const groupRate = completion(group.done, group.incomplete);
                const parts = slices(group);
                return (
                  <li key={group.id} className="border border-line bg-[#fffdf8] p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-display text-base font-semibold uppercase tracking-wide">{group.label}</p>
                      <p className="font-display text-sm font-semibold">{groupRate}%</p>
                    </div>
                    <div className="mt-3">
                      <Stack parts={parts} />
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      {statusName("done")} {group.done} · {statusName("incomplete")} {group.incomplete} · {statusName("review")}{" "}
                      {group.review} · {statusName("processing")} {group.processing} · {formatClock(group.seconds)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}
