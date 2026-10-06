import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { Locale } from "@/lib/i18n/locale";
import type { JobStatus, LiveJobStatus } from "@/types/titan";

export function JobRow({
  title,
  status,
  locale,
  detail,
}: {
  title: string;
  status: JobStatus | LiveJobStatus | string;
  locale: Locale;
  detail?: string;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4 last:border-0">
      <div>
        <p className="font-display text-sm font-semibold uppercase tracking-wide">{title}</p>
        {detail ? <p className="mt-1 text-sm text-muted">{detail}</p> : null}
      </div>
      <StatusBadge status={status} locale={locale} />
    </li>
  );
}
