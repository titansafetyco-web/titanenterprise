import { PayoutCard } from "@/components/dashboard/PayoutCard";
import type { Locale } from "@/lib/i18n/locale";
import type { OwnPayout } from "@/lib/wallet";

export function PayoutHistory({
  items,
  locale,
  empty,
}: {
  items: OwnPayout[];
  locale: Locale;
  empty: string;
}) {
  if (items.length === 0) {
    return <p className="bg-white px-6 py-8 text-sm text-muted">{empty}</p>;
  }
  return (
    <ul className="grid gap-4">
      {items.map((item) => (
        <PayoutCard key={item.id} payout={item} locale={locale} />
      ))}
    </ul>
  );
}
