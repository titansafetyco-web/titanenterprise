import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ApprovalQueue } from "@/components/admin/ApprovalQueue";
import { ProgramManager } from "@/components/program-manager";
import { ReviewButtons } from "@/components/review-buttons";
import { campaigns, inquiries, type InquiryStage } from "@/lib/admin";
import { listApplications } from "@/lib/applications";
import { getCurrentUser, listProfiles } from "@/lib/auth";
import { listChats } from "@/lib/chats";
import { listMessages } from "@/lib/messages";
import { contactChoices } from "@/lib/i18n/catalog";
import { localizeError } from "@/lib/i18n/errors";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { listPrograms } from "@/lib/programs";
import { site } from "@/lib/site";

const esPhrase: Record<string, string> = {
  "Safety products": "Productos de seguridad",
  "Energy solutions": "Soluciones de energía",
  "Digital media": "Medios digitales",
  "Software development": "Desarrollo de software",
  Insurance: "Seguros",
  "Confirm consent and start onboarding": "Confirmar el consentimiento e iniciar la incorporación",
  "Finish the application": "Terminar la solicitud",
  "Match the offer to the inquiry": "Relacionar la oferta con la consulta",
  "Track the completed signup": "Seguir el registro completado",
  "Review partner requirements": "Revisar los requisitos del socio",
  "Match the coverage offer to the inquiry": "Relacionar la oferta de cobertura con la consulta",
  "Safety product signup": "Registro de productos de seguridad",
  "Energy offer": "Oferta de energía",
  "Audience landing page": "Página de destino de audiencia",
  "Intake workflow": "Flujo de ingreso",
  "Insurance affiliates": "Afiliados de seguros",
  "Digital campaign": "Campaña digital",
  Referral: "Referido",
  Media: "Medios",
  Software: "Software",
  Live: "Activa",
  Review: "Revisión",
  Building: "En construcción",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${ui(await getLocale()).dashboard} · ${site.name}`,
    description: ui(await getLocale()).dashboardIntro,
  };
}

const stageStyles: Record<InquiryStage, string> = {
  New: "bg-canvas text-foreground",
  Qualified: "bg-accent text-ink",
  Onboarding: "bg-ink text-white",
  Enrolled: "border border-foreground text-foreground",
};

export default async function AdminPage() {
  const viewer = await getCurrentUser();
  if (!viewer) redirect("/login?next=/admin");
  if (viewer.role !== "admin") redirect("/dashboard");

  const locale = await getLocale();
  const t = ui(locale);
  const show = (text: string) => (locale === "es" ? (esPhrase[text] ?? text) : text);
  const choice = (text: string) => {
    const years = ["Less than 1 year", "1 to 3 years", "3 to 5 years", "More than 5 years"];
    const areas = ["Lead scouting", "Audience research", "Digital campaigns", "Onboarding support"];
    return text
      .split(", ")
      .map((part) => {
        const year = years.indexOf(part);
        if (year >= 0) return t.years[year];
        const area = areas.indexOf(part);
        if (area >= 0) return t.areaOptions[area];
        return show(part);
      })
      .join(", ");
  };
  const topic = (value: string) =>
    contactChoices(locale).find((item) => item.value === value)?.label ?? value;
  const stageLabel = (stage: string) =>
    stage === "New"
      ? t.stageNew
      : stage === "Qualified"
        ? t.stageQualified
        : stage === "Onboarding"
          ? t.stageOnboarding
          : stage === "Enrolled"
            ? t.stageEnrolled
            : stage;
  const messages = await listMessages();
  const chats = await listChats();
  const programs = await listPrograms();
  const applications = await listApplications();
  const accounts = await listProfiles();

  const counts = {
    open: inquiries.filter((item) => item.stage !== "Enrolled").length,
    qualified: inquiries.filter((item) => item.stage === "Qualified").length,
    onboarding: inquiries.filter((item) => item.stage === "Onboarding").length,
    enrolled: inquiries.filter((item) => item.stage === "Enrolled").length,
  };

  const realStats = [
    { label: t.totalAccounts, value: accounts.error ? "—" : String(accounts.items.length) },
    {
      label: t.approvedAccounts,
      value: accounts.error ? "—" : String(accounts.items.filter((item) => item.status === "approved").length),
    },
    {
      label: t.pendingAccountCount,
      value: accounts.error ? "—" : String(accounts.items.filter((item) => item.status === "pending").length),
    },
    {
      label: t.pendingApplications,
      value: applications.error ? "—" : String(applications.items.filter((item) => item.status === "pending").length),
    },
  ];

  const stats = [
    { label: t.openInquiries, value: counts.open },
    { label: t.qualified, value: counts.qualified },
    { label: t.onboarding, value: counts.onboarding },
    { label: t.enrolled, value: counts.enrolled },
  ];

  return (
    <div className="min-h-svh bg-canvas lg:flex">
      <AdminSidebar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-14">
          <section id="overview" className="scroll-mt-6">
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-5xl">
              {t.dashboard}
            </h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted">
              {t.dashboardIntro}
            </p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <li key={stat.label} className="border-t-4 border-accent bg-white p-6">
                  <p className="font-display text-4xl font-bold">{stat.value}</p>
                  <p className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">
                    {stat.label}
                  </p>
                </li>
              ))}
            </ul>
            <h2 className="mt-10 font-display text-2xl font-bold uppercase tracking-wide">{t.accountMetrics}</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {realStats.map((stat) => (
                <li key={stat.label} className="border-t-4 border-accent bg-white p-6">
                  <p className="font-display text-4xl font-bold">{stat.value}</p>
                  <p className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">
                    {stat.label}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <ApprovalQueue
            title={t.approvalQueue}
            empty={t.noPendingReview}
            requestLabel={t.requestInfo}
            rows={[
              ...accounts.items
                .filter((item) => item.status === "pending")
                .map((item) => ({
                  id: item.id,
                  name: item.name,
                  detail: item.email,
                  kind: "account" as const,
                })),
              ...applications.items
                .filter((item) => item.status === "pending")
                .map((item) => ({
                  id: item.id,
                  name: item.name,
                  detail: item.program,
                  kind: "application" as const,
                })),
            ]}
          />

          <div id="programs" className="scroll-mt-6">
            <ProgramManager programs={programs} />
          </div>

          <section id="accounts" className="mt-12 scroll-mt-6 bg-white">
            <div className="border-b border-line px-4 py-5 md:px-6">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
                {t.accounts}
              </h2>
            </div>
            {accounts.error ? (
              <p className="px-4 py-8 text-muted md:px-6">{localizeError(locale, accounts.error)}</p>
            ) : accounts.items.length === 0 ? (
              <p className="px-4 py-8 text-muted md:px-6">{t.noAccounts}</p>
            ) : (
              <ul>
                {accounts.items.map((item) => (
                  <li
                    key={item.id}
                    className="border-b border-line px-4 py-5 last:border-0 md:px-6"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="break-words font-display text-lg font-semibold uppercase tracking-wide">
                        {item.name}
                      </p>
                      <time
                        dateTime={item.createdAt}
                        className="text-xs text-muted sm:text-sm"
                      >
                        {new Date(item.createdAt).toLocaleString(locale === "es" ? "es" : "en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </time>
                    </div>
                    <p className="mt-1 break-all text-sm text-muted">
                      {item.email}
                      {item.phone ? ` · ${item.phone}` : ""}
                      {" · "}
                      {item.role === "agent"
                        ? t.roleAgent
                        : item.role === "admin"
                          ? t.roleAdmin
                          : item.role === "team"
                            ? t.roleTeam
                            : t.roleAffiliate}
                    </p>
                    <ReviewButtons id={item.id} kind="account" status={item.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="onboarding" className="mt-8 scroll-mt-6 bg-white">
            <div className="border-b border-line px-4 py-5 md:px-6">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
                {t.affiliateOnboarding}
              </h2>
            </div>
            {applications.error ? (
              <p className="px-4 py-8 text-muted md:px-6">{localizeError(locale, applications.error)}</p>
            ) : applications.items.length === 0 ? (
              <p className="px-4 py-8 text-muted md:px-6">{t.noForms}</p>
            ) : (
              <ul>
                {applications.items.map((item) => (
                  <li
                    key={item.id}
                    className="border-b border-line px-4 py-5 last:border-0 md:px-6"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="break-words font-display text-lg font-semibold uppercase tracking-wide">
                        {item.name}
                      </p>
                      <time
                        dateTime={item.createdAt}
                        className="text-xs text-muted sm:text-sm"
                      >
                        {new Date(item.createdAt).toLocaleString(locale === "es" ? "es" : "en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </time>
                    </div>
                    <p className="mt-1 break-all text-sm text-muted">
                      {item.email}
                      <span className="mx-2 text-accent">/</span>
                      {item.phone}
                    </p>
                    <p className="mt-3 break-words font-display text-sm font-semibold uppercase tracking-[0.12em]">
                      {show(item.program)}
                      {item.secondProgram ? ` / ${show(item.secondProgram)}` : ""}
                    </p>
                    <p className="mt-3 break-words text-sm text-muted">
                      {choice(item.years)}
                      <span className="mx-2 text-accent">/</span>
                      {choice(item.areas)}
                    </p>
                    <p className="mt-3 max-w-3xl whitespace-pre-wrap leading-relaxed">
                      {item.background}
                    </p>
                    {item.note ? (
                      <p className="mt-3 max-w-3xl whitespace-pre-wrap leading-relaxed text-muted">
                        {item.note}
                      </p>
                    ) : null}
                    <ReviewButtons
                      id={item.id}
                      kind="application"
                      status={item.status}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="messages" className="mt-12 scroll-mt-6 bg-white">
            <div className="border-b border-line px-4 py-5 md:px-6">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
                {t.contactMessages}
              </h2>
            </div>
            {messages.error ? (
              <p className="px-4 py-8 text-muted md:px-6">{localizeError(locale, messages.error)}</p>
            ) : messages.items.length === 0 ? (
              <p className="px-4 py-8 text-muted md:px-6">{t.noMessages}</p>
            ) : (
              <ul>
                {messages.items.map((item) => (
                  <li
                    key={item.id}
                    className="border-b border-line px-4 py-5 last:border-0 md:px-6"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="break-words font-display text-lg font-semibold uppercase tracking-wide">
                        {item.name}
                      </p>
                      <time
                        dateTime={item.createdAt}
                        className="text-xs text-muted sm:text-sm"
                      >
                        {new Date(item.createdAt).toLocaleString(locale === "es" ? "es" : "en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </time>
                    </div>
                    <p className="mt-1 break-all text-sm text-muted">
                      {item.email}
                      <span className="mx-2 text-accent">/</span>
                      {topic(item.interest)}
                    </p>
                    <p className="mt-3 max-w-3xl whitespace-pre-wrap leading-relaxed">
                      {item.message}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="chat" className="mt-8 scroll-mt-6 bg-white">
            <div className="border-b border-line px-4 py-5 md:px-6">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
                {t.chatSupport}
              </h2>
            </div>
            {chats.error ? (
              <p className="px-4 py-8 text-muted md:px-6">{localizeError(locale, chats.error)}</p>
            ) : chats.items.length === 0 ? (
              <p className="px-4 py-8 text-muted md:px-6">{t.noChats}</p>
            ) : (
              <ul>
                {chats.items.map((item) => (
                  <li
                    key={item.id}
                    className="border-b border-line px-4 py-5 last:border-0 md:px-6"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="break-words font-display text-lg font-semibold uppercase tracking-wide">
                        {item.name}
                      </p>
                      <time
                        dateTime={item.createdAt}
                        className="text-xs text-muted sm:text-sm"
                      >
                        {new Date(item.createdAt).toLocaleString(locale === "es" ? "es" : "en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </time>
                    </div>
                    <p className="mt-1 break-all text-sm text-muted">{item.email}</p>
                    <p className="mt-3 max-w-3xl whitespace-pre-wrap leading-relaxed">
                      {item.message}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="inquiries" className="mt-8 scroll-mt-6 bg-white">
            <div className="border-b border-line px-6 py-5">
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
                {t.inquiries}
              </h2>
            </div>
            <ul className="grid gap-3 p-4 lg:hidden">
              {inquiries.map((item) => (
                <li key={item.ref} className="border border-line bg-canvas p-4">
                  <p className="font-display text-sm font-semibold uppercase tracking-[0.12em]">{item.ref}</p>
                  <p className="mt-2 text-sm">{show(item.program)}</p>
                  <p className="mt-2">
                    <span
                      className={`inline-block px-2 py-1 font-display text-xs font-semibold uppercase tracking-[0.12em] ${stageStyles[item.stage]}`}
                    >
                      {stageLabel(item.stage)}
                    </span>
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{show(item.next)}</p>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[40rem] text-left">
                <thead>
                  <tr className="border-b border-line text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    <th className="px-6 py-3 font-display">{t.reference}</th>
                    <th className="px-6 py-3 font-display">{t.program}</th>
                    <th className="px-6 py-3 font-display">{t.stage}</th>
                    <th className="px-6 py-3 font-display">{t.nextStep}</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((item) => (
                    <tr key={item.ref} className="border-b border-line last:border-0">
                      <td className="px-6 py-4 font-display font-semibold tracking-wide">
                        {item.ref}
                      </td>
                      <td className="px-6 py-4">{show(item.program)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-1 font-display text-xs font-semibold uppercase tracking-[0.12em] ${stageStyles[item.stage]}`}
                        >
                          {stageLabel(item.stage)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted">{show(item.next)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="campaigns" className="mt-8 scroll-mt-6 bg-ink px-6 py-8 text-white md:px-8">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
              {t.campaigns}
              <span className="mt-3 block h-1 w-12 bg-accent" aria-hidden="true" />
            </h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-2">
              {campaigns.map((campaign) => (
                <li key={campaign.name} className="border-t border-white/15 pt-4">
                  <p className="font-display text-lg font-semibold uppercase tracking-wide">
                    {show(campaign.name)}
                  </p>
                  <p className="mt-2 text-sm text-white/70">
                    {show(campaign.channel)}
                    <span className="mx-2 text-accent">/</span>
                    <span className="text-accent">{show(campaign.status)}</span>
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
