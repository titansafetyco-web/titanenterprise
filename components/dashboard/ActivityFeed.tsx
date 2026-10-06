import type { WalletEntry } from "@/lib/money";
import { formatMoney } from "@/lib/money";
import type { Locale } from "@/lib/i18n/locale";

export function ActivityFeed({
  items,
  locale,
  empty,
}: {
  items: WalletEntry[];
  locale: Locale;
  empty: string;
}) {
  if (items.length === 0) {
    return <p className="bg-white px-6 py-8 text-sm text-muted">{empty}</p>;
  }
  return (
    <ul className="border border-line bg-white">
      {items.slice(0, 8).map((item) => (
        <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4 last:border-0">
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-wide">{item.otherName}</p>
            <p className="mt-1 text-sm text-muted">
              {new Date(item.createdAt).toLocaleDateString(locale === "es" ? "es" : "en-US", { dateStyle: "medium" })}
            </p>
          </div>
          <p className="font-display text-sm font-semibold">{formatMoney(item.amountCents, locale)}</p>
        </li>
      ))}
    </ul>
  );
}
