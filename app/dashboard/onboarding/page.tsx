import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { listApplications } from "@/lib/applications";
import { getCurrentUser } from "@/lib/auth";
import { localizeError } from "@/lib/i18n/errors";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).yourOnboarding} · Titan Safety Co.` };
}

function when(locale: string, value: string) {
  return new Date(value).toLocaleString(locale === "es" ? "es" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/onboarding");

  const locale = await getLocale();
  const t = ui(locale);
  const applications = await listApplications();
  const statusLabel = (status: string) =>
    status === "approved" ? t.statusApproved : status === "denied" ? t.statusDenied : t.statusPending;

  return (
    <section className="bg-white">
      <div className="border-b border-line px-6 py-5">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">{t.yourOnboarding}</h1>
      </div>
      {applications.error ? (
        <p className="px-6 py-8 text-muted">{localizeError(locale, applications.error)}</p>
      ) : applications.items.length === 0 ? (
        <p className="px-6 py-8 text-muted">{t.noForms}</p>
      ) : (
        <ul>
          {applications.items.map((item) => (
            <li key={item.id} className="border-b border-line px-6 py-5 last:border-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-lg font-semibold uppercase tracking-wide">
                  {item.program}
                  {item.secondProgram ? ` / ${item.secondProgram}` : ""}
                </p>
                <time dateTime={item.createdAt} className="text-sm text-muted">
                  {when(locale, item.createdAt)}
                </time>
              </div>
              <p className="mt-2 font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {statusLabel(item.status)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
