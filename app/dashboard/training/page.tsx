import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { listTraining } from "@/lib/api/training";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).trainingTitle} · Titan Safety Co.` };
}

export default async function TrainingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/training");
  const locale = await getLocale();
  const t = ui(locale);
  const { items, error } = await listTraining(locale);

  return (
    <section>
      <h1 className="font-display text-4xl font-bold uppercase tracking-wide">{t.trainingTitle}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{t.trainingNote}</p>
      {error ? <p className="mt-6 text-sm text-muted">{error}</p> : null}
      {items.length === 0 ? (
        <p className="mt-8 bg-white px-6 py-8 text-sm text-muted">{t.notAvailableYet}</p>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <li key={item.id} className="border border-line bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="font-display text-lg font-bold uppercase tracking-wide">{item.title}</h2>
                <StatusBadge status={item.status} locale={locale} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
              <p className="mt-4 text-sm text-muted">
                {item.duration} · {item.requiredScore}
              </p>
              {item.status === "locked" ? (
                <p className="mt-4 font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  {t.completeTraining}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
