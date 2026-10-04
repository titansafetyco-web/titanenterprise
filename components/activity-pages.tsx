"use client";

import { useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { ui } from "@/lib/i18n/ui";

const pageSize = 10;

type ActivityItem = {
  id: string;
  at: string;
  kind: "job" | "message" | "chat" | "onboarding";
  title: string;
};

export function ActivityPages({ items }: { items: readonly ActivityItem[] }) {
  const locale = useLocale();
  const t = ui(locale);
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pages - 1);
  const visible = items.slice(current * pageSize, current * pageSize + pageSize);
  const kindLabel = {
    job: t.activityJob,
    message: t.activityMessage,
    chat: t.activityChat,
    onboarding: t.activityOnboarding,
  };

  return (
    <div className="mt-4 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-5">
        <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">{t.recentActivity}</h3>
        {pages > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(current - 1)}
              disabled={current === 0}
              className="border border-line px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-canvas disabled:text-muted"
            >
              {t.activityPrevious}
            </button>
            <p className="min-w-12 text-center font-display text-xs font-semibold uppercase tracking-wider text-muted">
              {current + 1} / {pages}
            </p>
            <button
              type="button"
              onClick={() => setPage(current + 1)}
              disabled={current >= pages - 1}
              className="border border-line px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-canvas disabled:text-muted"
            >
              {t.activityNext}
            </button>
          </div>
        ) : null}
      </div>
      {visible.length === 0 ? (
        <p className="px-6 py-8 text-muted">{t.noActivity}</p>
      ) : (
        <ul>
          {visible.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line px-6 py-4 last:border-0"
            >
              <p>
                <span className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  {kindLabel[item.kind]}
                </span>
                {item.title ? <span className="mt-1 block">{item.title}</span> : null}
              </p>
              <time dateTime={item.at} className="text-sm text-muted">
                {new Date(item.at).toLocaleString(locale === "es" ? "es" : "en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
