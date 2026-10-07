import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountList } from "@/components/account-list";
import { AddMemberForm } from "@/components/add-member-form";
import { ReviewButtons } from "@/components/review-buttons";
import { getCurrentUser, listProfiles } from "@/lib/auth";
import { localizeError } from "@/lib/i18n/errors";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).teamMembers} · ${site.name}` };
}

export default async function TeamPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/team");
  if (user.role !== "admin") redirect("/dashboard");

  const locale = await getLocale();
  const t = ui(locale);
  const profiles = await listProfiles();
  const teamCount = profiles.items.filter((item) => item.role === "admin" || item.role === "team").length;
  const memberCount = profiles.items.filter((item) => item.role === "affiliate" || item.role === "agent").length;
  const review = profiles.items.filter((item) => item.status === "pending");
  const roleName = (role: string) =>
    role === "admin"
      ? t.roleAdmin
      : role === "agent"
        ? t.roleAgent
        : role === "team"
          ? t.roleTeam
          : role === "member"
            ? t.roleMember
            : t.roleAffiliate;

  return (
    <section className="bg-white">
      <AddMemberForm admin={user.role === "admin"} teamCount={teamCount} memberCount={memberCount} />
      {user.role === "admin" ? (
        <div className="mx-6 mt-6 border border-line bg-canvas">
          <div className="border-b border-line px-6 py-5">
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
              {t.pendingAccounts}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">{t.pendingAccountsLead}</p>
          </div>
          {review.length === 0 ? (
            <p className="px-6 py-6 text-sm text-muted">{t.noPendingAccounts}</p>
          ) : (
            <ul>
              {review.map((item) => (
                <li key={item.id} className="border-b border-line px-6 py-5 last:border-0">
                  <p className="font-display text-lg font-semibold uppercase tracking-wide">{item.name}</p>
                  <p className="mt-2 text-sm text-muted">
                    {item.email}
                    {item.phone ? ` · ${item.phone}` : ""}
                    {" · "}
                    {roleName(item.role)}
                  </p>
                  <ReviewButtons id={item.id} kind="account" status={item.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
      {profiles.error ? (
        <p className="px-6 py-8 text-muted">{localizeError(locale, profiles.error)}</p>
      ) : profiles.items.length === 0 ? (
        <p className="px-6 py-8 text-muted">{t.noTeam}</p>
      ) : (
        <AccountList accounts={profiles.items} />
      )}
    </section>
  );
}
