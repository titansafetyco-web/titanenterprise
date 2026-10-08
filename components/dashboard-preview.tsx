import { DashboardPreviewFrame } from "@/components/dashboard-preview-frame";
import { mockDashboardPreview } from "@/data/mockDashboard";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export async function DashboardPreview() {
  const locale = await getLocale();
  const t = ui(locale);
  const preview = mockDashboardPreview(locale);

  return (
    <section id="preview" className="border-y border-line bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-16">
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-accent md:text-xs md:tracking-[0.18em]">
          {t.previewKicker}
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-wide md:mt-3 md:text-3xl">{t.previewTitle}</h2>
        <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted md:mt-4 md:text-sm">{t.previewNote}</p>
        <DashboardPreviewFrame
          preview={preview}
          labels={{
            kicker: t.previewKicker,
            title: t.previewTitle,
            note: t.previewNote,
            member: t.previewMember,
            overview: t.overview,
            jobs: t.yourJobs,
            wallet: t.wallet,
            activity: t.previewActivity,
            opportunity: t.opportunity,
            status: t.status,
            submitted: t.submitted,
            compensation: t.compensation,
          }}
        />
      </div>
    </section>
  );
}
