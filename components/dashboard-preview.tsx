import { mockDashboardPreview } from "@/data/mockDashboard";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export async function DashboardPreview() {
  const locale = await getLocale();
  const t = ui(locale);
  const preview = mockDashboardPreview(locale);

  return (
    <section className="border-y border-line bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-16">
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-accent md:text-xs md:tracking-[0.18em]">
          {t.previewKicker}
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-wide md:mt-3 md:text-3xl">
          {t.previewTitle}
        </h2>
        <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted md:mt-4 md:text-sm">{t.previewNote}</p>
        <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 md:mt-8 md:gap-4">
          {preview.cards.map((card) => (
            <li key={card.label} className="border-t-4 border-accent bg-white p-4 md:p-6">
              <p className="font-display text-2xl font-bold md:text-3xl">{card.value}</p>
              <p className="mt-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-muted md:mt-2 md:text-xs md:tracking-[0.14em]">
                {card.label}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted md:mt-4 md:text-sm">{preview.payout}</p>
        <div className="mt-4 overflow-x-auto border border-line bg-white md:mt-6">
          <table className="min-w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="border-b border-line font-display text-[11px] uppercase tracking-[0.12em] text-muted md:text-xs md:tracking-[0.14em]">
                <th className="px-3 py-2.5 font-semibold md:px-4 md:py-3">{t.opportunity}</th>
                <th className="px-3 py-2.5 font-semibold md:px-4 md:py-3">{t.status}</th>
                <th className="px-3 py-2.5 font-semibold md:px-4 md:py-3">{t.submitted}</th>
                <th className="px-3 py-2.5 font-semibold md:px-4 md:py-3">{t.compensation}</th>
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((row) => (
                <tr key={row.opportunity} className="border-b border-line last:border-0">
                  <td className="px-3 py-3 md:px-4 md:py-4">{row.opportunity}</td>
                  <td className="px-3 py-3 md:px-4 md:py-4">{row.status}</td>
                  <td className="px-3 py-3 md:px-4 md:py-4">{row.submitted}</td>
                  <td className="px-3 py-3 md:px-4 md:py-4">{row.compensation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
