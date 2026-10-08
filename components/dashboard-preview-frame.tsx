"use client";

import { useState } from "react";
import type { DashboardPreviewData } from "@/data/mockDashboard";

type Preview = DashboardPreviewData;
type Panel = "overview" | "jobs" | "wallet";
type Filter = "all" | "review" | "approved";

const filters: Filter[] = ["all", "all", "review", "approved"];

export function DashboardPreviewFrame({
  preview,
  labels,
}: {
  preview: Preview;
  labels: {
    kicker: string;
    title: string;
    note: string;
    member: string;
    overview: string;
    jobs: string;
    wallet: string;
    activity: string;
    opportunity: string;
    status: string;
    submitted: string;
    compensation: string;
  };
}) {
  const [panel, setPanel] = useState<Panel>("overview");
  const [metric, setMetric] = useState(0);
  const [day, setDay] = useState(preview.activity.length - 1);
  const filter = filters[metric] ?? "all";
  const rows = preview.rows.filter((row) => filter === "all" || row.statusKey === filter);
  const nav = [
    { id: "overview" as const, label: labels.overview },
    { id: "jobs" as const, label: labels.jobs },
    { id: "wallet" as const, label: labels.wallet },
  ];

  return (
    <div className="mt-5 overflow-hidden rounded-md border border-[#e7dcc4] bg-white shadow-[0_16px_40px_rgba(28,22,12,0.08)] md:mt-8">
      <div className="flex items-center justify-between gap-3 border-b border-[#e7dcc4] bg-[#fbf6ec] px-4 py-3">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-[#9a7200]">{labels.kicker}</p>
        <p className="truncate font-display text-xs font-semibold uppercase tracking-[0.14em] text-[#6e5c43]">{labels.member}</p>
      </div>
      <div className="flex flex-col md:flex-row">
        <nav aria-label={labels.title} className="flex gap-1 border-b border-[#e7dcc4] bg-[#fbf6ec] p-2 md:w-48 md:flex-col md:border-b-0 md:border-r md:p-3">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={panel === item.id}
              onClick={() => setPanel(item.id)}
              className={`rounded-md px-3 py-2.5 text-left font-display text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                panel === item.id
                  ? "bg-[#fff4d2] text-[#1c160c] shadow-[inset_3px_0_0_#e0b000]"
                  : "text-[#6e5c43] hover:bg-[#f3e6c8] hover:text-[#2a2116]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="min-w-0 flex-1 p-4 md:p-6">
          {panel === "overview" ? (
            <Overview
              preview={preview}
              labels={labels}
              metric={metric}
              onMetric={setMetric}
              day={day}
              onDay={setDay}
              rows={rows}
            />
          ) : null}
          {panel === "jobs" ? <Jobs rows={preview.rows} labels={labels} /> : null}
          {panel === "wallet" ? <Wallet preview={preview} labels={labels} /> : null}
        </div>
      </div>
    </div>
  );
}

function Overview({
  preview,
  labels,
  metric,
  onMetric,
  day,
  onDay,
  rows,
}: {
  preview: Preview;
  labels: { activity: string; opportunity: string; status: string; submitted: string; compensation: string };
  metric: number;
  onMetric: (index: number) => void;
  day: number;
  onDay: (index: number) => void;
  rows: Preview["rows"];
}) {
  const peak = Math.max(...preview.activity);

  return (
    <div>
      <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {preview.cards.map((card, index) => (
          <li key={card.label}>
            <button
              type="button"
              aria-pressed={metric === index}
              onClick={() => onMetric(index)}
              className={`h-full w-full border-t-4 bg-white p-4 text-left transition-all ${
                metric === index
                  ? "border-accent shadow-[0_8px_20px_rgba(28,22,12,0.08)]"
                  : "border-[#e7dcc4] hover:-translate-y-0.5 hover:border-accent/70 hover:shadow-md"
              }`}
            >
              <p className="font-display text-2xl font-bold">{card.value}</p>
              <p className="mt-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{card.label}</p>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 border border-[#e7dcc4] bg-[#fbf6ec] p-4">
        <div className="flex items-end justify-between gap-3">
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e5c43]">{labels.activity}</p>
          <p className="font-display text-sm font-bold text-[#1c160c]">{preview.activity[day]}</p>
        </div>
        <div className="mt-3 flex h-16 items-end gap-1.5">
          {preview.activity.map((value, index) => (
            <button
              key={`${value}-${index}`}
              type="button"
              aria-pressed={day === index}
              aria-label={`${labels.activity} ${value}`}
              onClick={() => onDay(index)}
              className="flex h-full flex-1 items-end"
            >
              <span
                className={`block w-full rounded-sm transition-colors ${day === index ? "bg-accent" : "bg-[#e4d3ae] hover:bg-[#d4bc86]"}`}
                style={{ height: `${Math.max(12, Math.round((value / peak) * 100))}%` }}
              />
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted md:text-sm">{preview.payout}</p>
      <JobTable rows={rows} labels={labels} />
    </div>
  );
}

function Jobs({
  rows,
  labels,
}: {
  rows: Preview["rows"];
  labels: { opportunity: string; status: string };
}) {
  return (
    <ul className="grid gap-3">
      {rows.map((row) => (
        <li key={row.opportunity} className="border border-[#e7dcc4] bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-display text-sm font-bold uppercase tracking-wide">{row.opportunity}</p>
            <Status status={row.status} statusKey={row.statusKey} />
          </div>
          <p className="mt-2 text-xs text-muted">
            {labels.status}: {row.status}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#f3e6c8]" aria-hidden="true">
            <div className="h-full rounded-full bg-accent" style={{ width: `${row.progress}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Wallet({
  preview,
  labels,
}: {
  preview: Preview;
  labels: { wallet: string };
}) {
  const balance = preview.cards[3];
  const pending = preview.cards[2];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <article className="border-t-4 border-accent bg-[#fffaf1] p-5">
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{balance.label}</p>
          <p className="mt-2 font-display text-3xl font-bold">{balance.value}</p>
        </article>
        <article className="border-t-4 border-[#e4d3ae] bg-white p-5">
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{pending.label}</p>
          <p className="mt-2 font-display text-3xl font-bold">{pending.value}</p>
        </article>
      </div>
      <ul className="mt-4 border border-[#e7dcc4]">
        {preview.wallet.map((item) => (
          <li key={item.label} className="flex items-center justify-between gap-3 border-b border-[#e7dcc4] px-4 py-3 last:border-b-0">
            <p className="min-w-0 truncate text-sm">{item.label}</p>
            <p className={`shrink-0 font-display text-sm font-bold ${item.direction === "in" ? "text-[#146c43]" : "text-[#6e5c43]"}`}>
              {item.amount}
            </p>
          </li>
        ))}
      </ul>
      <p className="sr-only">{labels.wallet}</p>
    </div>
  );
}

function JobTable({
  rows,
  labels,
}: {
  rows: Preview["rows"];
  labels: { opportunity: string; status: string; submitted: string; compensation: string };
}) {
  return (
    <div className="mt-4 overflow-x-auto border border-[#e7dcc4]">
      <table className="min-w-full text-left text-xs md:text-sm">
        <thead>
          <tr className="border-b border-[#e7dcc4] bg-[#fbf6ec] font-display text-[11px] uppercase tracking-[0.12em] text-[#6e5c43]">
            <th className="px-3 py-2.5 font-semibold md:px-4 md:py-3">{labels.opportunity}</th>
            <th className="px-3 py-2.5 font-semibold md:px-4 md:py-3">{labels.status}</th>
            <th className="px-3 py-2.5 font-semibold md:px-4 md:py-3">{labels.submitted}</th>
            <th className="px-3 py-2.5 font-semibold md:px-4 md:py-3">{labels.compensation}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.opportunity} className="border-b border-[#e7dcc4] last:border-0 hover:bg-[#fffaf1]">
              <td className="px-3 py-3 md:px-4 md:py-4">{row.opportunity}</td>
              <td className="px-3 py-3 md:px-4 md:py-4">
                <Status status={row.status} statusKey={row.statusKey} />
              </td>
              <td className="px-3 py-3 text-muted md:px-4 md:py-4">{row.submitted}</td>
              <td className="px-3 py-3 md:px-4 md:py-4">{row.compensation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Status({ status, statusKey }: { status: string; statusKey: "review" | "approved" }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-[0.12em] ${
        statusKey === "review" ? "bg-[#fff4d2] text-[#7a5b00]" : "bg-[#e7f6ee] text-[#146c43]"
      }`}
    >
      {status}
    </span>
  );
}
