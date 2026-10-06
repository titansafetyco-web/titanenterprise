import { formatMoney, type WalletEntry } from "@/lib/money";
import type { Locale } from "@/lib/i18n/locale";

export function LedgerTable({
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
    <div className="overflow-x-auto border border-line bg-white">
      <table className="min-w-full text-left text-sm">
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-line last:border-0">
              <td className="px-4 py-4 font-display text-xs font-semibold uppercase tracking-wide">{item.otherName}</td>
              <td className="px-4 py-4 text-muted">
                {new Date(item.createdAt).toLocaleDateString(locale === "es" ? "es" : "en-US", { dateStyle: "medium" })}
              </td>
              <td className="px-4 py-4 text-right font-display font-semibold">{formatMoney(item.amountCents, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
