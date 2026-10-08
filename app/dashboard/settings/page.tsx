import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsPanel } from "@/components/settings-panel";
import { avatarUrl } from "@/lib/avatar";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import { siteIsClosed } from "@/lib/maintenance";
import { site } from "@/lib/site";
import { listTestimonials } from "@/lib/testimonials";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${ui(await getLocale()).settings} · ${site.name}` };
}

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/settings");

  const t = ui(await getLocale());
  const roleName =
    user.role === "agent"
      ? t.roleAgent
      : user.role === "admin"
        ? t.roleAdmin
        : user.role === "team"
          ? t.roleTeam
          : user.role === "member"
            ? t.roleMember
            : t.roleAffiliate;

  const closed = await siteIsClosed();
  const reviews = user.role === "admin" ? (await listTestimonials()) ?? [] : [];

  return (
    <SettingsPanel
      name={user.name}
      email={user.email}
      phone={user.phone}
      role={roleName}
      photo={avatarUrl(user.avatarPath)}
      birthDate={user.birthDate}
      region={user.state}
      admin={user.role === "admin"}
      closed={closed}
      reviews={reviews}
    />
  );
}
